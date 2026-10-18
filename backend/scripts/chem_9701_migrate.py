"""Chemistry 9701 curriculum mapping (idempotent, logged, reversible).
  python3 -m scripts.chem_9701_migrate --db edvnova_chem_staging --dry-run
  python3 -m scripts.chem_9701_migrate --db edvnova_chem_staging --apply
  python3 -m scripts.chem_9701_migrate --db edvnova_chem_staging --rollback <run_id>
Applying to the main database additionally requires --approved."""
import argparse, json, os, sys, uuid
from datetime import datetime, timezone
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from curriculum.chem_9701_spec import UNVERIFIED_PLACEMENT, parse  # noqa: E402

load_dotenv(Path(__file__).resolve().parents[1] / ".env")
MAIN_DB = os.environ["DB_NAME"]
SUBJ = "chemistry"
BOARD_TITLE = {"as-level": "AS Level", "a-level": "A Level"}

MAP = {
    ("as-level", "atomic-structure", "electron-configuration"): "1.3",
    ("as-level", "atomic-structure", "ionisation-energy"): "1.4",
    ("as-level", "atoms-molecules-stoichiometry", "mole-calculations"): "2.2",
    ("as-level", "atoms-molecules-stoichiometry", "chemical-equations"): "2.3",
    ("as-level", "chemical-bonding", "electronegativity"): "3.1",
    ("as-level", "chemical-bonding", "ionic-bonding"): "3.2",
    ("as-level", "chemical-bonding", "covalent-bonding"): "3.4",
    ("as-level", "chemical-bonding", "shapes-of-molecules"): "3.5",
    ("as-level", "chemical-bonding", "intermolecular-forces"): "3.6",
    ("as-level", "states-of-matter", "gases"): "4.1",
    ("as-level", "chemical-energetics", "enthalpy-changes"): "5.1",
    ("as-level", "chemical-energetics", "hess-law"): "5.2",
    ("as-level", "electrochemistry", "redox-reactions"): "6.1",
    ("as-level", "electrochemistry", "electrolysis"): "24.1",
    ("as-level", "electrochemistry", "electrode-potentials"): "24.2",
    ("as-level", "chemical-equilibria", "equilibrium-constants"): "7.1",
    ("as-level", "organic-chemistry-intro", "nomenclature"): "13.1",
    ("as-level", "organic-chemistry-intro", "alkanes"): "14.1",
    ("as-level", "organic-chemistry-intro", "alkenes"): "14.2",
    ("as-level", "organic-chemistry-intro", "halogenoalkanes"): "15.1",
    ("as-level", "organic-chemistry-intro", "alcohols"): "16.1",
    ("a-level", "reaction-kinetics", "rate-equations"): "26.1",
    ("a-level", "reaction-kinetics", "activation-energy"): "8.2",
    ("a-level", "chemical-equilibria-advanced", "acid-base-equilibria"): "25.1",
    ("a-level", "organic-chemistry-advanced", "aldehydes-and-ketones"): "17.1",
    ("a-level", "analytical-chemistry", "infrared-spectroscopy"): "22.1",
    ("a-level", "analytical-chemistry", "mass-spectrometry"): "22.2",
}
REVIEW = {
    ("as-level", "atomic-structure", "orbitals"): "Overlaps 1.3 subtopic 'Atomic orbitals'",
    ("as-level", "atoms-molecules-stoichiometry", "atomic-structure"): "Possibly 1.1 Subatomic particles; sits in Chapter 2",
    ("as-level", "chemical-energetics", "bond-energies"): "Overlaps 5.1 subtopic 'Bond-energy calculations'",
    ("as-level", "chemical-equilibria", "equilibrium-concepts"): "Overlaps 7.1 (already mapped to Equilibrium Constants, which has content)",
    ("as-level", "chemical-equilibria", "le-chatelier-principle"): "Overlaps 7.1 subtopic 'Le Chatelier's principle'",
    ("as-level", "states-of-matter", "liquids"): "No direct 2025-2027 topic; may support 4.2",
    ("as-level", "states-of-matter", "solids"): "Possibly 4.2 Bonding and structure",
    ("a-level", "reaction-kinetics", "order-of-reaction"): "Overlaps 26.1 subtopic 'Order and overall order'",
    ("a-level", "chemical-equilibria-advanced", "kc-and-kp"): "Overlaps AS 7.1 (Kc, Kp)",
    ("a-level", "chemical-equilibria-advanced", "buffer-solutions"): "Overlaps 25.1 subtopic 'Buffer solutions'",
    ("a-level", "chemical-equilibria-advanced", "solubility-product"): "Overlaps 25.1 subtopic 'Solubility product Ksp'",
    ("a-level", "organic-chemistry-advanced", "carboxylic-acids-and-esters"): "Spans AS 18.1/18.2 and A 33.x",
    ("a-level", "organic-chemistry-advanced", "nitrogen-compounds"): "Spans AS 19 and A 34",
    ("a-level", "organic-chemistry-advanced", "polymerisation"): "Spans AS 20 and A 35",
    ("a-level", "organic-chemistry-advanced", "organic-synthesis"): "Spans AS 21 and A 36",
    ("a-level", "analytical-chemistry", "nmr-spectroscopy"): "Spans 37.3 and 37.4",
    ("a-level", "analytical-chemistry", "chromatography"): "Spans 37.1 and 37.2",
}
EMPTY_CONTENT = {"introduction": "", "sections": [], "definitions": [], "formulas": [], "worked_examples": [],
                 "common_mistakes": [], "examiner_tips": [], "summary": []}


def now():
    return datetime.now(timezone.utc).isoformat()


def has_content(c):
    return isinstance(c, dict) and any((len(v) > 0 if isinstance(v, (list, str)) else bool(v)) for v in c.values())


class Plan:
    def __init__(self, db, run_id):
        self.db, self.run_id, self.ops = db, run_id, []

    def update(self, coll, doc, changes, note):
        diff = {k: v for k, v in changes.items() if doc.get(k) != v}
        if diff:
            self.ops.append({"op": "update", "coll": coll, "_id": doc["_id"], "set": diff,
                             "before": {k: doc.get(k, "__absent__") for k in diff}, "note": note})

    def insert(self, coll, doc, note):
        self.ops.append({"op": "insert", "coll": coll, "doc": doc, "note": note})

    def flag(self, doc, note):
        self.ops.append({"op": "flag", "coll": "curriculum_topics", "_id": doc["_id"], "note": note})


def dependencies(db, t):
    tid = str(t["_id"])
    path = f"{t['board_slug']}/{SUBJ}/{t['chapter_slug']}/{t['slug']}"
    return {
        "content": has_content(t.get("content")),
        "assets": db.learning_assets.count_documents({"parent_id": tid}) + db.topic_attachments.count_documents({"topic_id": tid}),
        "progress": db.learning_progress.count_documents({"board": t["board_slug"], "subject": SUBJ, "chapter": t["chapter_slug"], "topic": t["slug"]})
        + db.topic_progress.count_documents({"topic_path": {"$regex": f"{t['chapter_slug']}/{t['slug']}$"}}),
        "bookmarks": db.bookmarks.count_documents({"topic_path": path}),
        "published": t.get("status") == "published",
    }


def build(db, run_id):
    plan = Plan(db, run_id)
    spec = parse()
    topics = db.curriculum_topics
    meta = {"syllabus_code": "9701", "syllabus_version": "2025-2027", "verification_status": "unverified"}

    subj = db.curriculum_subjects.find_one({"board_slug": "a-level", "slug": SUBJ})
    plan.update("curriculum_subjects", subj, {"foundation_board": "as-level", "syllabus_code": "9701"}, "A Level Chemistry includes AS foundation")
    as_subj = db.curriculum_subjects.find_one({"board_slug": "as-level", "slug": SUBJ})
    plan.update("curriculum_subjects", as_subj, {"syllabus_code": "9701"}, "Syllabus code")

    by_ref, spec_keys = {}, set()
    for ch in spec:
        order = sum(1 for c in spec if c["board"] == ch["board"] and spec.index(c) < spec.index(ch))
        spec_keys.add((ch["board"], ch["slug"]))
        practical = ch["kind"] == "practical"
        ch_meta = {**meta, "coursebook_number": "" if practical else ch["syllabus_number"], "syllabus_number": ch["syllabus_number"] if practical else "",
                   "syllabus_topics": sorted({t["syllabus_ref"].split(".")[0] for t in ch["topics"]}, key=lambda x: (len(x), x)),
                   "nav_status": "active", "section": ch["section"], "level": ch["level"], "kind": ch["kind"], "order": order}
        existing = db.curriculum_chapters.find_one({"board_slug": ch["board"], "subject_slug": SUBJ, "slug": ch["slug"]})
        if existing:
            changes = dict(ch_meta)
            if existing["name"] != ch["name"]:
                changes["name"] = ch["name"]
            if "coursebook_ref" not in existing:
                changes["coursebook_ref"] = ""
            plan.update("curriculum_chapters", existing, changes, f"Chapter {ch['syllabus_number']}")
        else:
            plan.insert("curriculum_chapters", {"board_slug": ch["board"], "subject_slug": SUBJ, "slug": ch["slug"], "name": ch["name"],
                                                "description": "", "topic_count": 0, "coursebook_ref": "", **ch_meta,
                                                "created_at": now(), "migration_run": run_id}, f"New chapter {ch['syllabus_number']}")
        for ti, t in enumerate(ch["topics"]):
            by_ref[t["syllabus_ref"]] = (ch, t, ti)

    for ch in db.curriculum_chapters.find({"subject_slug": SUBJ, "board_slug": {"$in": ["as-level", "a-level"]}}):
        if (ch["board_slug"], ch["slug"]) not in spec_keys:
            plan.update("curriculum_chapters", ch, {"nav_status": "retired", "order": 900 + int(ch.get("order", 0)) if int(ch.get("order", 0)) < 900 else int(ch["order"])},
                        f"Retire non-coursebook chapter {ch['slug']} (records kept; hidden from student navigation unless it has published lessons)")

    mapped_ids = set()
    for ref, (ch, t, ti) in by_ref.items():
        target = {"board_slug": ch["board"], "chapter_slug": ch["slug"], "chapter_title": ch["name"], "board_title": BOARD_TITLE[ch["board"]], "order": ti}
        t_meta = {**meta, "syllabus_ref": ref, "syllabus_title": t["title"], "level": ch["level"],
                  "coursebook_placement": "unverified" if ref in UNVERIFIED_PLACEMENT else "mapped"}
        doc = topics.find_one({"subject_slug": SUBJ, "syllabus_ref": ref, "board_slug": {"$in": ["as-level", "a-level"]}})
        src = next((k for k, v in MAP.items() if v == ref), None)
        if not doc and src:
            doc = topics.find_one({"board_slug": src[0], "subject_slug": SUBJ, "chapter_slug": src[1], "slug": src[2]})
        if doc:
            mapped_ids.add(doc["_id"])
            moving = (doc["board_slug"], doc["chapter_slug"]) != (ch["board"], ch["slug"])
            deps = dependencies(db, doc)
            if moving and any(deps.values()):
                plan.flag(doc, f"{ref}: move blocked, record has dependencies {deps}")
                continue
            changes = {**t_meta, **target}
            if "subtopics" not in doc:
                changes["subtopics"] = [{**s, "order": i} for i, s in enumerate(t["subtopics"])]
            if not deps["content"] and not deps["published"] and doc.get("title") != t["title"]:
                changes["title"] = t["title"]
            if moving:
                changes["mapped_from"] = {"board_slug": doc["board_slug"], "chapter_slug": doc["chapter_slug"]}
            plan.update("curriculum_topics", doc, changes, f"{ref} reuse {doc['board_slug']}/{doc['chapter_slug']}/{doc['slug']}")
        else:
            slug = t["slug"]
            if topics.find_one({"board_slug": ch["board"], "subject_slug": SUBJ, "chapter_slug": ch["slug"], "slug": slug}):
                slug = f"{slug}-{ref.replace('.', '-')}"
            plan.insert("curriculum_topics", {"board_slug": ch["board"], "subject_slug": SUBJ, "slug": slug, "title": t["title"],
                                              "subject_title": "Chemistry", "study_time": "", "difficulty": "", "status": "draft",
                                              "seo_title": "", "seo_description": "", "content": EMPTY_CONTENT,
                                              "subtopics": [{**s, "order": i} for i, s in enumerate(t["subtopics"])],
                                              **t_meta, **target, "created_at": now(), "updated_at": now(), "migration_run": run_id},
                        f"New draft topic {ref}")

    for key, note in REVIEW.items():
        doc = topics.find_one({"board_slug": key[0], "subject_slug": SUBJ, "chapter_slug": key[1], "slug": key[2]})
        if doc and doc["_id"] not in mapped_ids:
            plan.update("curriculum_topics", doc, {"syllabus_review": {"status": "needs_review", "note": note}, "order": int(doc.get("order", 0)) if int(doc.get("order", 0)) >= 900 else 900 + int(doc.get("order", 0))}, f"Flag for review: {note}")
    others = topics.find({"subject_slug": SUBJ, "board_slug": {"$in": ["as-level", "a-level"]}, "_id": {"$nin": list(mapped_ids)}})
    for doc in others:
        key = (doc["board_slug"], doc["chapter_slug"], doc["slug"])
        if key not in REVIEW and "migration_run" not in doc and "syllabus_ref" not in doc:
            plan.flag(doc, "Unmapped record left unchanged")
    return plan


def apply(db, plan):
    log = {"run_id": plan.run_id, "started_at": now(), "ops": []}
    for op in plan.ops:
        coll = db[op["coll"]]
        if op["op"] == "update":
            coll.update_one({"_id": op["_id"]}, {"$set": op["set"]})
            log["ops"].append({"op": "update", "coll": op["coll"], "_id": op["_id"], "before": op["before"]})
        elif op["op"] == "insert":
            res = coll.insert_one(op["doc"])
            log["ops"].append({"op": "insert", "coll": op["coll"], "_id": res.inserted_id})
    for ch in db.curriculum_chapters.find({"subject_slug": SUBJ, "board_slug": {"$in": ["as-level", "a-level"]}}):
        n = db.curriculum_topics.count_documents({"board_slug": ch["board_slug"], "subject_slug": SUBJ, "chapter_slug": ch["slug"]})
        if ch.get("topic_count") != n:
            db.curriculum_chapters.update_one({"_id": ch["_id"]}, {"$set": {"topic_count": n}})
            log["ops"].append({"op": "update", "coll": "curriculum_chapters", "_id": ch["_id"], "before": {"topic_count": ch.get("topic_count", "__absent__")}})
    log["finished_at"] = now()
    db.migration_log.insert_one(log)
    return log


def rollback(db, run_id):
    log = db.migration_log.find_one({"run_id": run_id})
    if not log:
        sys.exit("Run not found")
    skipped = []
    for op in reversed(log["ops"]):
        coll = db[op["coll"]]
        if op["op"] == "insert":
            doc = coll.find_one({"_id": op["_id"]})
            if doc and op["coll"] == "curriculum_topics" and (has_content(doc.get("content")) or doc.get("status") == "published"):
                skipped.append(str(op["_id"]))
                continue
            coll.delete_one({"_id": op["_id"]})
        else:
            unset = {k: "" for k, v in op["before"].items() if v == "__absent__"}
            setv = {k: v for k, v in op["before"].items() if v != "__absent__"}
            upd = {**({"$set": setv} if setv else {}), **({"$unset": unset} if unset else {})}
            if upd:
                coll.update_one({"_id": op["_id"]}, upd)
    db.migration_log.update_one({"run_id": run_id}, {"$set": {"rolled_back_at": now(), "rollback_skipped": skipped}})
    print(f"Rolled back {run_id}; skipped (now contain authored content): {skipped}")


def report(plan, path):
    lines = [f"# Chemistry 9701 mapping: dry-run report ({plan.run_id})", "", f"Generated {now()}", ""]
    for kind in ("insert", "update", "flag"):
        ops = [o for o in plan.ops if o["op"] == kind]
        lines += [f"## {kind.title()}s ({len(ops)})", ""]
        for o in ops:
            if kind == "update":
                ch = {k: (o["before"][k], v) for k, v in o["set"].items() if k not in ("subtopics",)}
                lines.append(f"- [{o['coll']}] {o['note']}: " + "; ".join(f"{k}: {json.dumps(b, default=str, ensure_ascii=False)} → {json.dumps(a, default=str, ensure_ascii=False)}" for k, (b, a) in ch.items()) + (" (+subtopics)" if "subtopics" in o["set"] else ""))
            elif kind == "insert":
                d = o["doc"]
                lines.append(f"- [{o['coll']}] {o['note']}: {d['board_slug']}/{d.get('chapter_slug', '')}/{d['slug']} \"{d.get('title') or d.get('name')}\"")
            else:
                lines.append(f"- {o['note']} ({o['_id']})")
        lines.append("")
    Path(path).write_text("\n".join(lines))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--dry-run", action="store_true")
    g.add_argument("--apply", action="store_true")
    g.add_argument("--rollback")
    ap.add_argument("--approved", action="store_true")
    ap.add_argument("--report", default="/app/memory/chem_9701_dry_run.md")
    a = ap.parse_args()
    if a.db == MAIN_DB and not a.dry_run and not a.approved:
        sys.exit(f"Refusing to modify main database '{MAIN_DB}' without --approved")
    db = MongoClient(os.environ["MONGO_URL"])[a.db]
    if a.rollback:
        rollback(db, a.rollback)
        sys.exit()
    plan = build(db, uuid.uuid4().hex[:10])
    counts = {k: sum(1 for o in plan.ops if o["op"] == k) for k in ("insert", "update", "flag")}
    if a.dry_run:
        report(plan, a.report)
        print("DRY RUN", counts, "report:", a.report)
    else:
        log = apply(db, plan)
        print("APPLIED run", plan.run_id, counts, "logged ops:", len(log["ops"]))

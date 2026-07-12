from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
import os, pathlib, uuid


def create_questions_routes(db, get_current_user, get_admin_user):
    router = APIRouter(prefix="/questions")

    # ── Pydantic Models ──
    class QuestionCreate(BaseModel):
        subject: str
        board: str
        topic: str
        chapter: Optional[str] = ""
        difficulty: str = "medium"
        paper_type: str = "structured"
        question_text: str
        question_image_url: Optional[str] = ""
        marks: Optional[int] = 0
        answer: Optional[str] = ""
        mark_scheme: Optional[str] = ""
        tags: Optional[List[str]] = []
        year: Optional[str] = ""
        paper_number: Optional[str] = ""
        question_id: Optional[str] = ""

    class QuestionUpdate(BaseModel):
        subject: Optional[str] = None
        board: Optional[str] = None
        topic: Optional[str] = None
        chapter: Optional[str] = None
        difficulty: Optional[str] = None
        paper_type: Optional[str] = None
        question_text: Optional[str] = None
        question_image_url: Optional[str] = None
        marks: Optional[int] = None
        answer: Optional[str] = None
        mark_scheme: Optional[str] = None
        tags: Optional[List[str]] = None
        year: Optional[str] = None
        paper_number: Optional[str] = None
        is_active: Optional[bool] = None
        question_id: Optional[str] = None

    # ── Helper ──
    def doc_to_response(doc):
        return {k: v for k, v in doc.items() if k != "_id"} | {"id": str(doc["_id"])}

    def validate_oid(oid_str):
        if not ObjectId.is_valid(oid_str):
            raise HTTPException(400, "Invalid ID format")
        return ObjectId(oid_str)

    # ── Question ID Generator ──
    SUBJECT_CODES = {"physics": "P", "chemistry": "C", "biology": "B", "mathematics": "M"}

    async def generate_question_id(subject, topic):
        code = SUBJECT_CODES.get(subject, "X")
        topic_code = "".join(w[0] for w in (topic or "GEN").split()[:2]).upper()
        count = await db.questions.count_documents({"subject": subject}) + 1
        return f"{code}-{topic_code}-{count:03d}"

    # ══════════════════════════════════════════
    # ADMIN ENDPOINTS
    # ══════════════════════════════════════════

    @router.post("/admin/create")
    async def create_question(data: QuestionCreate, request: Request):
        await get_admin_user(request)
        now = datetime.now(timezone.utc).isoformat()
        doc = data.model_dump()
        if not doc.get("question_id"):
            doc["question_id"] = await generate_question_id(doc["subject"], doc.get("topic", ""))
        doc["is_active"] = True
        doc["created_at"] = now
        doc["updated_at"] = now
        result = await db.questions.insert_one(doc)
        return {"id": str(result.inserted_id), "question_id": doc["question_id"], "message": "Question created"}

    @router.put("/admin/{question_id}")
    async def update_question(question_id: str, data: QuestionUpdate, request: Request):
        await get_admin_user(request)
        update = {k: v for k, v in data.model_dump().items() if v is not None}
        update["updated_at"] = datetime.now(timezone.utc).isoformat()
        result = await db.questions.update_one({"_id": validate_oid(question_id)}, {"$set": update})
        if result.matched_count == 0:
            raise HTTPException(404, "Question not found")
        return {"message": "Question updated"}

    @router.delete("/admin/{question_id}")
    async def delete_question(question_id: str, request: Request):
        await get_admin_user(request)
        await db.questions.delete_one({"_id": validate_oid(question_id)})
        return {"message": "Question deleted"}

    @router.get("/admin/list")
    async def admin_list_questions(request: Request, subject: str = "", board: str = "", topic: str = "", difficulty: str = "", paper_type: str = "", q: str = "", page: int = 1, limit: int = 30):
        await get_admin_user(request)
        query = {}
        if subject: query["subject"] = subject
        if board: query["board"] = board
        if topic: query["topic"] = {"$regex": topic, "$options": "i"}
        if difficulty: query["difficulty"] = difficulty
        if paper_type: query["paper_type"] = paper_type
        if q: query["$or"] = [{"question_text": {"$regex": q, "$options": "i"}}, {"topic": {"$regex": q, "$options": "i"}}]
        total = await db.questions.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.questions.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"questions": [doc_to_response(d) for d in docs], "total": total, "page": page}

    @router.get("/admin/stats")
    async def admin_question_stats(request: Request):
        await get_admin_user(request)
        total = await db.questions.count_documents({})
        by_subject = {}
        for s in ["physics", "chemistry", "biology", "mathematics"]:
            by_subject[s] = await db.questions.count_documents({"subject": s})
        by_board = {}
        for b in ["igcse", "as-level", "a-level"]:
            by_board[b] = await db.questions.count_documents({"board": b})
        return {"total": total, "by_subject": by_subject, "by_board": by_board}

    @router.post("/admin/upload-image")
    async def upload_question_image(request: Request, file: UploadFile = File(...)):
        await get_admin_user(request)
        upload_dir = pathlib.Path("/app/uploads/questions")
        upload_dir.mkdir(parents=True, exist_ok=True)
        ext = file.filename.split(".")[-1] if "." in file.filename else "png"
        filename = f"{uuid.uuid4().hex[:12]}.{ext}"
        filepath = upload_dir / filename
        content = await file.read()
        with open(filepath, "wb") as f:
            f.write(content)
        return {"url": f"/api/uploads/questions/{filename}"}

    @router.post("/admin/bulk-import")
    async def bulk_import_questions(request: Request):
        """Import multiple questions at once. Expects {questions: [...]}"""
        await get_admin_user(request)
        body = await request.json()
        items = body.get("questions", [])
        if not items:
            raise HTTPException(400, "No questions provided")
        now = datetime.now(timezone.utc).isoformat()
        docs = []
        for idx, item in enumerate(items):
            subj = item.get("subject", "physics")
            topic_val = item.get("topic", "")
            doc = {
                "subject": subj,
                "board": item.get("board", "igcse"),
                "topic": topic_val,
                "chapter": item.get("chapter", ""),
                "difficulty": item.get("difficulty", "medium"),
                "paper_type": item.get("paper_type", "structured"),
                "question_text": item.get("question_text", ""),
                "question_image_url": item.get("question_image_url", ""),
                "marks": item.get("marks", 0),
                "answer": item.get("answer", ""),
                "mark_scheme": item.get("mark_scheme", ""),
                "tags": item.get("tags", []),
                "year": item.get("year", ""),
                "paper_number": item.get("paper_number", ""),
                "question_id": item.get("question_id", ""),
                "is_active": True,
                "created_at": now,
                "updated_at": now,
            }
            if doc["question_text"].strip():
                if not doc["question_id"]:
                    doc["question_id"] = await generate_question_id(subj, topic_val)
                docs.append(doc)
        if docs:
            await db.questions.insert_many(docs)
        return {"message": f"{len(docs)} questions imported", "count": len(docs)}

    # ══════════════════════════════════════════
    # PUBLIC / STUDENT ENDPOINTS
    # ══════════════════════════════════════════

    @router.get("/browse")
    async def browse_questions(subject: str = "", board: str = "", topic: str = "", difficulty: str = "", paper_type: str = "", page: int = 1, limit: int = 20):
        query = {"is_active": True}
        if subject: query["subject"] = subject
        if board: query["board"] = board
        if topic: query["topic"] = {"$regex": topic, "$options": "i"}
        if difficulty: query["difficulty"] = difficulty
        if paper_type: query["paper_type"] = paper_type
        total = await db.questions.count_documents(query)
        skip = (page - 1) * limit
        docs = await db.questions.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        return {"questions": [doc_to_response(d) for d in docs], "total": total, "page": page}

    @router.get("/topics")
    async def get_question_topics(subject: str = "", board: str = ""):
        """Get distinct topics for filter dropdowns."""
        query = {"is_active": True}
        if subject: query["subject"] = subject
        if board: query["board"] = board
        topics = await db.questions.distinct("topic", query)
        return sorted(topics)

    @router.get("/{question_id}")
    async def get_question(question_id: str):
        doc = await db.questions.find_one({"_id": validate_oid(question_id)})
        if not doc:
            raise HTTPException(404, "Question not found")
        return doc_to_response(doc)

    # ── Student Bookmarks ──
    @router.post("/bookmark/{question_id}")
    async def toggle_bookmark(question_id: str, request: Request):
        user = await get_current_user(request)
        existing = await db.question_bookmarks.find_one({"user_id": user["id"], "question_id": question_id})
        if existing:
            await db.question_bookmarks.delete_one({"_id": existing["_id"]})
            return {"bookmarked": False}
        await db.question_bookmarks.insert_one({
            "user_id": user["id"],
            "question_id": question_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"bookmarked": True}

    @router.get("/user/bookmarks")
    async def get_user_bookmarks(request: Request):
        user = await get_current_user(request)
        bookmarks = await db.question_bookmarks.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
        return bookmarks

    @router.post("/complete/{question_id}")
    async def toggle_complete(question_id: str, request: Request):
        user = await get_current_user(request)
        existing = await db.question_completions.find_one({"user_id": user["id"], "question_id": question_id})
        if existing:
            await db.question_completions.delete_one({"_id": existing["_id"]})
            return {"completed": False}
        await db.question_completions.insert_one({
            "user_id": user["id"],
            "question_id": question_id,
            "completed_at": datetime.now(timezone.utc).isoformat()
        })
        return {"completed": True}

    @router.get("/user/completions")
    async def get_user_completions(request: Request):
        user = await get_current_user(request)
        completions = await db.question_completions.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
        return completions

    # ══════════════════════════════════════════
    # SEED SAMPLE QUESTIONS
    # ══════════════════════════════════════════
    async def seed_questions():
        count = await db.questions.count_documents({})
        if count > 0:
            return
        now = datetime.now(timezone.utc).isoformat()
        samples = [
            {"subject":"physics","board":"igcse","topic":"Electricity","chapter":"Current, Voltage & Resistance","difficulty":"easy","paper_type":"structured","question_text":"State Ohm's law and explain the relationship between voltage, current and resistance.","marks":3,"answer":"Ohm's law states that the current through a conductor is directly proportional to the potential difference across it, provided the temperature remains constant.\n\nV = IR\n\nWhere V = voltage (V), I = current (A), R = resistance (Ω)","mark_scheme":"1 mark: Current proportional to p.d. [1]\n1 mark: At constant temperature [1]\n1 mark: V = IR stated or explained [1]","tags":["ohms-law","resistance","current"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"physics","board":"igcse","topic":"Electricity","chapter":"Current, Voltage & Resistance","difficulty":"medium","paper_type":"structured","question_text":"A 12V battery is connected to two resistors in series. The first resistor has a resistance of 4Ω and the second has a resistance of 8Ω.\n\n(a) Calculate the total resistance of the circuit. [1]\n(b) Calculate the current flowing through the circuit. [2]\n(c) Calculate the voltage across each resistor. [2]","marks":5,"answer":"(a) Total resistance = 4 + 8 = 12Ω\n\n(b) I = V/R = 12/12 = 1A\n\n(c) V₁ = IR₁ = 1 × 4 = 4V\nV₂ = IR₂ = 1 × 8 = 8V","mark_scheme":"(a) R = 4 + 8 = 12Ω [1]\n(b) I = V/R [1]; I = 12/12 = 1A [1]\n(c) V₁ = 1 × 4 = 4V [1]; V₂ = 1 × 8 = 8V [1]","tags":["series-circuits","resistance","calculations"],"year":"2022","paper_number":"Paper 4"},
            {"subject":"physics","board":"igcse","topic":"Forces & Motion","chapter":"Newton's Laws","difficulty":"medium","paper_type":"structured","question_text":"A car of mass 1200 kg accelerates from rest to 20 m/s in 8 seconds.\n\n(a) Calculate the acceleration of the car. [2]\n(b) Calculate the resultant force acting on the car. [2]\n(c) Explain why the actual engine force must be greater than your answer to (b). [1]","marks":5,"answer":"(a) a = (v-u)/t = (20-0)/8 = 2.5 m/s²\n\n(b) F = ma = 1200 × 2.5 = 3000 N\n\n(c) The engine must also overcome friction/air resistance, so the driving force must be greater than the resultant force.","mark_scheme":"(a) a = (v-u)/t [1]; a = 2.5 m/s² [1]\n(b) F = ma [1]; F = 3000 N [1]\n(c) Friction/air resistance must be overcome [1]","tags":["acceleration","f-equals-ma","friction"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"physics","board":"igcse","topic":"Waves","chapter":"Properties of Waves","difficulty":"easy","paper_type":"mcq","question_text":"Which of the following is a transverse wave?\n\nA) Sound wave\nB) Ultrasound\nC) Light wave\nD) Compression wave","marks":1,"answer":"C) Light wave","mark_scheme":"C [1]","tags":["transverse","wave-types"],"year":"2022","paper_number":"Paper 1"},
            {"subject":"chemistry","board":"igcse","topic":"Atomic Structure","chapter":"Particles in the Atom","difficulty":"easy","paper_type":"structured","question_text":"Complete the table to show the relative charge and relative mass of the three subatomic particles.\n\nParticle | Relative charge | Relative mass\nProton | _____ | _____\nNeutron | _____ | _____\nElectron | _____ | _____","marks":3,"answer":"Proton: +1, 1\nNeutron: 0, 1\nElectron: -1, 1/1840 (negligible)","mark_scheme":"Proton: +1, 1 [1]\nNeutron: 0, 1 [1]\nElectron: -1, negligible/1/1840 [1]","tags":["proton","neutron","electron","subatomic"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"chemistry","board":"igcse","topic":"Bonding","chapter":"Ionic and Covalent","difficulty":"medium","paper_type":"structured","question_text":"Sodium chloride and diamond both have high melting points.\n\n(a) Explain why sodium chloride has a high melting point. [2]\n(b) Explain why diamond has a high melting point. [2]\n(c) State one difference in their electrical conductivity when molten. [1]","marks":5,"answer":"(a) Sodium chloride has strong electrostatic forces of attraction between oppositely charged ions Na⁺ and Cl⁻. A lot of energy is needed to overcome these forces.\n\n(b) Diamond has strong covalent bonds between carbon atoms in a giant covalent structure. A lot of energy is needed to break these bonds.\n\n(c) Molten sodium chloride conducts electricity (ions free to move), but molten diamond does not (no free charges).","mark_scheme":"(a) Strong electrostatic attraction [1]; between oppositely charged ions [1]\n(b) Strong covalent bonds [1]; giant structure/many bonds to break [1]\n(c) NaCl conducts when molten, diamond does not [1]","tags":["ionic","covalent","melting-point","conductivity"],"year":"2022","paper_number":"Paper 4"},
            {"subject":"chemistry","board":"igcse","topic":"Stoichiometry","chapter":"Mole Calculations","difficulty":"hard","paper_type":"structured","question_text":"25.0 cm³ of 0.100 mol/dm³ sodium hydroxide solution was exactly neutralised by 20.0 cm³ of sulfuric acid.\n\n2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O\n\n(a) Calculate the number of moles of NaOH used. [1]\n(b) Determine the number of moles of H₂SO₄ that reacted. [1]\n(c) Calculate the concentration of the sulfuric acid in mol/dm³. [1]","marks":3,"answer":"(a) n = c × V = 0.100 × 25.0/1000 = 0.00250 mol\n\n(b) Mole ratio 2:1, so n(H₂SO₄) = 0.00250/2 = 0.00125 mol\n\n(c) c = n/V = 0.00125/(20.0/1000) = 0.0625 mol/dm³","mark_scheme":"(a) 0.00250 mol [1]\n(b) 0.00125 mol [1]\n(c) 0.0625 mol/dm³ [1]","tags":["titration","moles","concentration"],"year":"2023","paper_number":"Paper 4"},
            {"subject":"biology","board":"igcse","topic":"Cell Structure","chapter":"Animal and Plant Cells","difficulty":"easy","paper_type":"structured","question_text":"Name three structures found in both plant and animal cells, and two structures found only in plant cells.","marks":5,"answer":"Both: Cell membrane, cytoplasm, nucleus (also accept: ribosomes, mitochondria)\n\nPlant only: Cell wall, chloroplasts (also accept: large central vacuole)","mark_scheme":"Both plant and animal: cell membrane [1]; cytoplasm [1]; nucleus [1]\nPlant only: cell wall [1]; chloroplasts / large vacuole [1]","tags":["cell-structure","plant-cell","animal-cell"],"year":"2022","paper_number":"Paper 2"},
            {"subject":"biology","board":"igcse","topic":"Enzymes","chapter":"Factors Affecting Enzymes","difficulty":"medium","paper_type":"structured","question_text":"An experiment was carried out to investigate the effect of temperature on the rate of an enzyme-controlled reaction.\n\n(a) Describe how the rate of reaction changes as temperature increases from 20°C to 40°C. [1]\n(b) Explain what happens to the enzyme above 40°C. [2]\n(c) Define the term 'optimum temperature'. [1]","marks":4,"answer":"(a) The rate increases as temperature increases.\n\n(b) Above 40°C, the enzyme begins to denature. The active site changes shape and the substrate can no longer fit, so the reaction rate decreases.\n\n(c) The optimum temperature is the temperature at which the enzyme works at its fastest rate.","mark_scheme":"(a) Rate increases [1]\n(b) Enzyme denatures [1]; active site changes shape / substrate cannot fit [1]\n(c) Temperature at which enzyme activity is greatest/fastest [1]","tags":["enzymes","denaturation","temperature"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"biology","board":"igcse","topic":"Photosynthesis","chapter":"Limiting Factors","difficulty":"medium","paper_type":"structured","question_text":"A student investigated the effect of light intensity on the rate of photosynthesis using pondweed.\n\n(a) State the word equation for photosynthesis. [1]\n(b) Name two factors, other than light intensity, that could limit the rate of photosynthesis. [2]\n(c) Suggest how the student could measure the rate of photosynthesis in this experiment. [1]","marks":4,"answer":"(a) Carbon dioxide + water → glucose + oxygen\n\n(b) Temperature and carbon dioxide concentration\n\n(c) Count the number of oxygen bubbles produced per minute / collect and measure the volume of oxygen produced.","mark_scheme":"(a) CO₂ + water → glucose + O₂ [1]\n(b) Temperature [1]; CO₂ concentration [1]\n(c) Count bubbles per unit time / measure O₂ volume [1]","tags":["photosynthesis","limiting-factors","pondweed"],"year":"2022","paper_number":"Paper 4"},
            {"subject":"mathematics","board":"igcse","topic":"Algebra","chapter":"Solving Equations","difficulty":"easy","paper_type":"structured","question_text":"Solve the following equations:\n\n(a) 3x + 7 = 22 [2]\n(b) 5(2x - 1) = 35 [2]","marks":4,"answer":"(a) 3x = 22 - 7 = 15\nx = 5\n\n(b) 10x - 5 = 35\n10x = 40\nx = 4","mark_scheme":"(a) 3x = 15 [1]; x = 5 [1]\n(b) 10x - 5 = 35 or 10x = 40 [1]; x = 4 [1]","tags":["linear-equations","solving"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"mathematics","board":"igcse","topic":"Trigonometry","chapter":"SOHCAHTOA","difficulty":"medium","paper_type":"structured","question_text":"In a right-angled triangle, the hypotenuse is 13 cm and one of the shorter sides is 5 cm.\n\n(a) Calculate the length of the third side. [2]\n(b) Calculate the angle between the hypotenuse and the side of length 5 cm. [2]","marks":4,"answer":"(a) Using Pythagoras: a² + 5² = 13²\na² = 169 - 25 = 144\na = 12 cm\n\n(b) cos θ = adjacent/hypotenuse = 5/13\nθ = cos⁻¹(5/13) = 67.4°","mark_scheme":"(a) Use of Pythagoras [1]; 12 cm [1]\n(b) cos θ = 5/13 [1]; θ = 67.4° [1]","tags":["pythagoras","trigonometry","cosine"],"year":"2022","paper_number":"Paper 2"},
            {"subject":"mathematics","board":"igcse","topic":"Statistics","chapter":"Mean, Median, Mode","difficulty":"easy","paper_type":"structured","question_text":"The ages of 7 students are: 14, 15, 13, 16, 14, 15, 14\n\n(a) Find the mode. [1]\n(b) Find the median. [1]\n(c) Calculate the mean. [2]","marks":4,"answer":"(a) Mode = 14 (appears 3 times)\n\n(b) Ordered: 13, 14, 14, 14, 15, 15, 16\nMedian = 14 (4th value)\n\n(c) Mean = (13+14+14+14+15+15+16)/7 = 101/7 = 14.4 (1 d.p.)","mark_scheme":"(a) 14 [1]\n(b) 14 [1]\n(c) Sum = 101 [1]; 101/7 = 14.4 [1]","tags":["averages","statistics","mean-median-mode"],"year":"2023","paper_number":"Paper 2"},
            {"subject":"physics","board":"igcse","topic":"Energy","chapter":"Energy Stores & Transfers","difficulty":"easy","paper_type":"mcq","question_text":"A ball is thrown vertically upwards. Which energy transfer takes place as the ball rises?\n\nA) Kinetic energy → gravitational potential energy\nB) Gravitational potential energy → kinetic energy\nC) Chemical energy → kinetic energy\nD) Thermal energy → kinetic energy","marks":1,"answer":"A) Kinetic energy → gravitational potential energy","mark_scheme":"A [1]","tags":["energy-transfer","kinetic","gravitational"],"year":"2023","paper_number":"Paper 1"},
            {"subject":"chemistry","board":"igcse","topic":"Acids Bases Salts","chapter":"Neutralisation","difficulty":"medium","paper_type":"structured","question_text":"Hydrochloric acid reacts with sodium hydroxide solution.\n\n(a) Write a balanced chemical equation for this reaction. [2]\n(b) Name the type of reaction. [1]\n(c) Describe one method to confirm that the solution has been neutralised. [1]","marks":4,"answer":"(a) HCl + NaOH → NaCl + H₂O\n\n(b) Neutralisation\n\n(c) Add universal indicator — it turns green at pH 7 when neutralised. OR Use a pH meter and check for pH 7.","mark_scheme":"(a) Correct formulae [1]; balanced [1]\n(b) Neutralisation [1]\n(c) Indicator turns green / pH 7 [1]","tags":["neutralisation","acid-base","equation"],"year":"2022","paper_number":"Paper 2"},
        ]
        for idx, s in enumerate(samples):
            s["is_active"] = True
            s["question_image_url"] = ""
            code = SUBJECT_CODES.get(s["subject"], "X")
            topic_code = "".join(w[0] for w in (s.get("topic", "GEN")).split()[:2]).upper()
            s["question_id"] = f"{code}-{topic_code}-{idx+1:03d}"
            s["created_at"] = now
            s["updated_at"] = now
        await db.questions.insert_many(samples)
        await db.questions.create_index([("subject", 1), ("board", 1), ("topic", 1)])
        await db.questions.create_index([("question_text", "text")])
        await db.questions.create_index([("question_id", 1)])

    return router, seed_questions

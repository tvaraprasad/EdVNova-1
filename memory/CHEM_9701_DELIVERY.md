# Chemistry 9701 (AS + A Level): Delivery and Approval Pack

Status: built and tested in **isolated staging only**. The main database (`test_database`) is byte-identical to the backup in every collection, verified 2026-10-18.

## Safety
- Backup: `/root/edvnova_backups/20261018T102139Z` (mongodump of all 30 collections + uploads.tar.gz, SHA256SUMS verified, owner-only permissions). The restore test into a scratch DB showed identical counts, IDs and content; the scratch DB was then dropped.
- Object storage files are hosted by Emergent and are not part of the dump. Nothing in this work deletes or overwrites them, and staging runs with the storage key blanked.
- Staging DB: `edvnova_chem_staging`, an anonymised copy (8 non-admin users renamed, contacts and orders redacted, AI chats removed). It is served only by the staging backend on 127.0.0.1:8002.
- Private preview: `/?staging=<STAGING_ACCESS_KEY>` (the key is in /app/frontend/.env). Without the cookie, `/staging/api` returns 403. `?staging=off` exits. The live site is never pointed at staging.
- Staging has the AI, email and storage keys blanked and payments in test mode.
- Migration guard: `--apply` on the main DB is refused unless `--approved` is passed.

## Migration (scripts/chem_9701_migrate.py)
- Read-only dry run against MAIN: `/app/memory/chem_9701_dry_run_MAIN.md`, with 97 inserts (27 chapters, 70 draft topics), 58 updates and 0 blocked.
- Reuses all 12 existing chapters and 27 existing topics with the same `_id` and slug. Only metadata, order and the target chapter change.
- Only empty, unpublished, dependency-free drafts are moved. A move is blocked automatically if a record has content, assets, progress, bookmarks or a published status.
- The one published lesson, "Equilibrium Constants", keeps its title, content and status and is tagged 7.1.
- 17 uncertain drafts are left in place, flagged `syllabus_review.needs_review` and hidden from students (examples: orbitals, liquids, solids, kc-and-kp, buffer-solutions, nmr-spectroscopy, chromatography).
- Rerunnable: a second run plans 0 changes.
- Rollback: `--rollback <run_id>` restores the logged "before" values and deletes inserted records, unless an inserted record has since been authored or published. Tested in staging: the state after rollback hash-matches the state before.

## Approved release steps (only after the owner approves)
1. `python3 -m scripts.chem_9701_migrate --db test_database --dry-run` and compare with the MAIN report
2. Take a fresh backup (same mongodump command)
3. `python3 -m scripts.chem_9701_migrate --db test_database --apply --approved` and record the run_id
4. If anything looks wrong: `--rollback <run_id> --approved`, or mongorestore the fresh backup

The code changes are backward compatible. On the main DB, nothing changes until step 3 because the new fields are absent.

## Not verified / pending
- The subtopic labels and topic titles are your EdVNova labels. All are marked `verification_status: unverified`. I did not check them against the official 9701 2025-2027 syllabus PDF, and the learning outcomes are not mapped yet.
- Coursebook references: the field exists (empty), but no references were provided.
- Mastery: no assessment system exists, so mastery is never awarded (an honest note is shown).
- Practical P3/P5 chapters exist as drafts and stay hidden until a topic is published.
- In dev mode, the lesson visit request is sent twice because of React StrictMode. This is harmless and only happens in dev.

## Corrections made 2026-10-18 (staging only, iteration 27: all tests pass)
- AS Level Chemistry: Chapters 1-22 + Paper 3. Full A Level Chemistry: AS Foundation 1-22, A Level Extension 23-37, Paper 3 (the shared AS record) + Paper 5. Empty chapters are labelled "Coming soon".
- The title "Full A Level Chemistry" appears in the outline, breadcrumb, subject card and continue card. A Level Extension is expanded by default. AS Foundation is collapsed (except for the active chapter) and can be expanded with one click.
- A lesson is available only when it is published and has content or attached files. Drafts and empty published lessons cannot be opened, visited or completed by students and do not count towards progress. Admins can still see them, and publishing a lesson with content makes it available automatically.
- Navigation uses official 9701 topic labels (syllabus_title). The published lesson keeps its title "Equilibrium Constants" and its URL.
- Label-only staging update (run 188e9a19d0): 8 chapter names, 56 draft titles, 57 syllabus_title fields. No IDs, slugs, content or progress were changed. A leftover "TEST" section was removed from staging 7.1.
- MAIN dry run regenerated (read-only): 97 inserts, 58 updates, 0 blocked.
- Code-level effect on the main preview: the published-but-empty IGCSE Maths "Fractions" lesson now shows as Coming soon (no data was changed).

## Coursebook chapter structure (staging run e4f4aea0a1, 2026-10-18)
- Navigation now follows the Ryan & Norris coursebook. AS is Chapters 1-18. A Level Extension is Chapters 19-30 and is listed first in the Full A Level view. AS Foundation is a collapsible section below it. Paper 3 and Paper 5 are separate Practical skills sections.
- Topics keep their 9701 syllabus refs (syllabus_ref and syllabus_topics on each chapter); chapters carry coursebook_number.
- Records were reused: 2 chapters inserted (electrons-in-atoms, entropy-gibbs-free-energy). 9 non-coursebook chapters were set to nav_status=retired and kept for admins; they are hidden from students unless they hold published lessons. Empty draft topics were moved into the coursebook chapters. The published 7.1 lesson was not moved (same ID, chapter and URL; 8 progress records intact).
- Placement of topics marked coursebook_placement=unverified needs checking against the book: 22.2, 20.1, 19.1, 19.2, 21.1, 22.1, 27.1, 29.1, 29.2, 31.1, 32.2, 32.1, 29.4. The coursebook file was not in the uploads, so the order inside each chapter follows syllabus order.
- Pre-change staging dump: /root/edvnova_backups/staging_pre_coursebook. MAIN dry run regenerated: 91 inserts, 58 updates, 0 blocked.

## Root cause of "still four categories" (2026-10-18)
- Main preview and website read DB test_database. It still has the old 4 A Level chapters, because the release has not been approved.
- The staging view (cookie via /?staging=<key>) reads edvnova_chem_staging. It already has the 18 + 12 coursebook chapters.
- The staging backend ran as a manual background process and had stopped. It is now supervisor-managed (/etc/supervisor/conf.d/staging_backend.conf, port 8002). The staging cookie now lasts 30 days.
- The sidebar no longer prefixes topics with syllabus numbers (shown in a tooltip instead). The chapter page shows "9701 syllabus x.y" as a separate muted tag.
- Release: `python -m scripts.chem_9701_migrate --db test_database --apply --approved` (91 inserts, 58 updates, 0 blocked; old 4 chapters reused/renamed, organic-chemistry-advanced retired and its topics remapped). Take a fresh mongodump first. Rollback with `--rollback <run_id>`.

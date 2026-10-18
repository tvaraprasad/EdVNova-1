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

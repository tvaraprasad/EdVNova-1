"""Create edvnova_chem_staging from the latest verified backup and anonymise personal data.
Usage: python3 create_staging.py   (never touches the main DB_NAME database)"""
import subprocess, sys
from pathlib import Path
from pymongo import MongoClient

STAGING = "edvnova_chem_staging"
URI = "mongodb://localhost:27017"
SOURCE = "test_database"
ADMIN_EMAIL = "admin@edvnova.com"

backup = Path(Path("/root/edvnova_backups/LATEST").read_text().strip())
client = MongoClient(URI)
if STAGING in client.list_database_names():
    sys.exit(f"{STAGING} already exists; drop it explicitly before recreating.")
subprocess.run(["mongorestore", "--quiet", f"--uri={URI}", f"--nsFrom={SOURCE}.*", f"--nsTo={STAGING}.*", str(backup / "dump")], check=True)
db = client[STAGING]

n = 0
for i, u in enumerate(db.users.find({"email": {"$ne": ADMIN_EMAIL}}, {"_id": 1})):
    db.users.update_one({"_id": u["_id"]}, {"$set": {"email": f"user{i + 1}@staging.local", "name": f"Staging User {i + 1}", "phone": ""}})
    n += 1
db.contacts.update_many({}, {"$set": {"name": "Redacted", "email": "redacted@staging.local", "phone": "", "message": "[redacted in staging]"}})
db.orders.update_many({}, {"$set": {"shipping_address": {}, "customer_email": "redacted@staging.local", "customer_name": "Redacted", "phone": ""}})
db.ai_chats.delete_many({})
db.staging_meta.insert_one({"source_backup": str(backup), "anonymised_users": n})
print(f"Staging DB {STAGING} created from {backup}; anonymised {n} users, contacts, orders; cleared ai_chats.")

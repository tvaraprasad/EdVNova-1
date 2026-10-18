#!/bin/bash
# Starts the private staging backend (port 8002, DB edvnova_chem_staging). AI, email and file storage keys are blanked.
cd /app/backend
pkill -f "uvicorn server:app --host 127.0.0.1 --port 8002" 2>/dev/null
DB_NAME=edvnova_chem_staging EMERGENT_LLM_KEY= RESEND_API_KEY= SENDER_EMAIL= PAYMENT_MODE=test \
  nohup uvicorn server:app --host 127.0.0.1 --port 8002 > /root/edvnova_staging_backend.log 2>&1 &
sleep 4
curl -s -o /dev/null -w "staging backend: %{http_code}\n" http://127.0.0.1:8002/api/

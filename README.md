# freemoney-starter (DEMO)

This is a demo full-stack starter for *freemoney* — includes a Next.js frontend and Express backend (SQLite). It implements:
- register/login (JWT)
- wallet topup request + upload slip
- server-side OCR using tesseract.js (demo)
- auto-approve logic + admin review
- reward redemption skeleton

## Run locally
1. Backend: cd backend && npm install && cp .env.example .env && node index.js
2. Frontend: cd frontend && npm install && npm run dev

API base defaults to http://localhost:4000 — change NEXT_PUBLIC_API_BASE when needed.

## Notes
- This is a demo. Do NOT use for real-money production without legal review and security hardening.
- For production OCR & reliability use Cloud Vision/AWS Textract and rate-limit file uploads.

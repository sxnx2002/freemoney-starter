Freemoney (backend + frontend) - Render-ready starter
===================================================

Quick start:
1. Copy .env.example to .env and update values (if needed).
2. In backend: run `npm install` then `npm run create-admin` (or let Render run it during deploy).
3. Push repo to GitHub and create two Web Services on Render:
   - Backend: root directory `backend`, start command `npm start`
   - Frontend: root directory `frontend`, build command `npm install && npm run build`, start `npm start`
4. Set Environment Variables on Render from .env.example (use the DATABASE_URL provided by Render's Postgres).
5. Deploy and check Logs.

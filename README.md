# VZNX — Project & Team Management

> Lightweight operating system for architecture studios — tracks projects, tasks and team members.

This repository contains a full-stack sample for the VZNX assignment:

- `backend/` — Node.js + Express API with Mongoose models
- `frontend/` — React + TypeScript (Vite) single-page app using TailwindCSS

Quick start (development)

1. Backend

```powershell
cd D:\vznx\backend; npm install
# copy .env.example to .env and fill values (MONGODB_URI, JWT_SECRET, etc.)
npm run dev
```

2. Frontend

```powershell
cd D:\vznx\frontend; npm install
# set frontend env vars (copy .env.example -> .env) — e.g. VITE_API_URL
npm run dev
```

API

- The backend exposes REST endpoints under `/api` (see `backend/routes/`).
- Example: `GET /projects`, `POST /projects`, `GET /projects/:id/tasks`.

Environment

- Backend sample vars (add to `backend/.env`):

  - `MONGODB_URI` — MongoDB connection string
  - `JWT_SECRET` — secret for signing tokens
  - `PORT` — server port (default 4000)

- Frontend sample vars (add to `frontend/.env`):
  - `VITE_API_URL` — base URL of the backend API (e.g. `http://localhost:4000`)

Development notes

- Frontend uses Contexts for auth and app state (`src/context`) and small presentational components in `src/components`.
- Backend models live in `backend/models` (Project, Task, TeamMember, User) and controllers in `backend/controllers`.
- For local testing you can use `mongodb-memory-server` or run a local MongoDB instance.

Testing

- Add Jest/RTL tests to the frontend and Jest + Supertest for backend routes. Use MSW (frontend) and `mongodb-memory-server` (backend) for isolated tests.

Deployment

- The project is structured to deploy individually:
  - Backend can be deployed to Railway, Heroku, or any Node host. Store secrets in the provider's secret store.
  - Frontend can be built with `npm run build` and hosted on Vercel, Netlify, or served from a static host.

Contributing

- Open a PR against `main`. Keep changes small and add tests for behavioral changes.

License

This repo is for interview/sample purposes. Add a license file if you plan to open-source it.


# Project Nexus v1

Project Nexus is a self-hosted MVP for sharing project documentation using links.

## What is included

- Home page with all projects
- Create, edit, delete projects
- Local file upload support for `.md`, `.pdf`, `.docx`, and image files
- Markdown rendering in browser
- PDF and DOCX download
- Project metadata:
  - title
  - description
  - cover image
  - progress percentage
  - status (Active/Archived)
  - last updated
- Public/private toggle
- Shareable public URL
- Simple changelog section
- Dark mode

## Project structure

- `/frontend` – React + Vite web app
- `/backend` – Express API and local storage logic
- `/storage` – Local data and uploaded files

## Run locally

### 1) Start backend

```bash
cd /home/runner/work/clion/clion/backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

### 2) Start frontend

```bash
cd /home/runner/work/clion/clion/frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

If needed, set `VITE_API_URL` in frontend to point to a different backend URL.

## Notes

- All data is stored on local disk.
- Uploaded files are stored in `/home/runner/work/clion/clion/storage/projects`.
- Project metadata is stored in `/home/runner/work/clion/clion/storage/data/projects.json`.

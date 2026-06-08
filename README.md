# Job Finder

A full‑stack job‑search and interview‑scheduling app.

## 🚀 Quick start (local development)

1. **Clone the repo** (you already have it).
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Create an environment file** – copy the example and fill in your values:
   ```bash
   cp .env.example .env
   ```
   - `MONGO_URI` – MongoDB connection string (optional – the server works without a DB and uses a mock login).
   - `JWT_SECRET` – secret for JWT tokens.
   - `PORT` – port for the backend (default `5001`).
4. **Start the backend**
   ```bash
   node backend/server.js
   ```
   The server will start even if MongoDB is unavailable.
5. **Open the frontend**
   Open any HTML file under `frontend/` (e.g., `frontend/company-login.html`) in a browser. The UI talks to `http://localhost:5001/api/...`.

## 📁 Project structure
```
Job-Finder/
├─ backend/                # Express API
│   ├─ config/             # DB connection (MongoDB)
│   ├─ controllers/       # Business logic
│   ├─ middleware/         # auth, error handling
│   ├─ routes/            # API routes (auth, jobs, company, etc.)
│   ├─ uploads/            # Resume uploads (created at runtime)
│   ├─ server.js           # Main entry point
│   └─ package.json
├─ frontend/               # Static HTML/CSS/JS pages
│   ├─ css/                # Styles (Tailwind via CDN, you can replace later)
│   ├─ img/                # Images / icons
│   └─ *.html             # company-login.html, applicants.html, …
├─ .env.example            # Template env variables
├─ README.md                # ← **this file**
└─ package.json            # Root (runs backend server)
```

## 🛠️ Important notes
- **Multer** is installed for resume uploads (`backend/routes/jobRoutes.js`).
- The server will **fallback to a mock company login** when the DB is not reachable, so you can test the UI without MongoDB.
- All routes are prefixed with `/api`. Adjust `API_URL` in `frontend/js/api.js` if you change the host/port.

## 📦 Deployment options (choose one)
1. **Vercel (frontend) + Railway (backend)** – recommended for a quick production setup.
   - Vercel: point the project root to `frontend/` (or use a `vercel.json`).
   - Railway: connect the same repo, it will run `npm install` and `node backend/server.js`.
2. **Render** – full‑stack (single service) – set the build command to `npm install` and the start command to `node backend/server.js`.
3. **Docker** – you can containerise the backend and serve the static files via Nginx.
   - See the `Dockerfile` example below if you need it.

## 🐳 Docker example (optional)
```Dockerfile
# Backend image
FROM node:22-alpine AS backend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY backend ./backend
COPY .env.example .env
EXPOSE 5001
CMD ["node", "backend/server.js"]

# Frontend image (served by Nginx)
FROM nginx:alpine AS frontend
COPY frontend /usr/share/nginx/html
```

## 🎉 That's it!
You now have a clear README, a template `.env.example`, and an organized folder layout so you won’t get confused.

# Tech_Zephyr — Hackathon Edition 

Project Name: Skill_Craft

Skill_Craft is a full-stack application that connects people by skills and projects. It includes user profiles (with skills and reputation), project creation and discovery, real-time chat, and notification support. The frontend is built with Vite + React (TypeScript) and the backend is a Node.js + Express API with MongoDB as the datastore.

Repository layout

- `Backend/` — primary backend (Express, routes, models)
	- `app.js` — server start and middleware
	- `package.json` — backend scripts
	- `models/` — data models: `UserProfile.js`, `Project.js`, `Skill.js`, `Notification.js`
	- `routes/` — API routes: `userRoutes.js`, `projectRoutes.js`, `skillsRoutes.js`, `notificationRoutes.js`, `discoverRoutes.js`, `chatRoutes.js`
 - `Frontend/` (Frontend) — frontend (Vite + React + TypeScript)
	 - `package.json` — frontend scripts
	 - `src/` — React app, components, hooks, pages
	 - `public/` — static assets

Hackathon quick setup (PowerShell commands)

Open PowerShell and run these steps. They assume you have Node.js and npm installed.

```powershell
# 1) Backend setup
cd .\Backend
npm install
copy .env-copy .env     # edit .env to set MONGODB_URI and any keys
node app.js

# 2) Frontend setup (new window/terminal recommended)
cd .\Frontend
npm install

# 3) Start backend and frontend (in two terminals)
cd ..\Backend
npm run dev              # or `node app.js`

cd ..\Frontend
npm run dev
```

One-liner (for judges/demo):

```powershell
# Runs backend and frontend in their own terminals (needs two shells)
start pwsh -NoExit -Command "cd .\Backend; npm run dev"; start pwsh -NoExit -Command "cd .\Frontend; npm run dev"
```

Environment variables (minimum)

- `MONGODB_URI` — MongoDB connection string (local or Atlas)
- `PORT` — backend port (defaults to 5000 if unset)
- `JWT_SECRET` — if authentication is used

Copy `Backend/.env-copy` to `Backend/.env` and edit it before starting.

Tech stack

- Frontend: React (TypeScript) + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Mongoose-style models in `Backend/models`)
- Dev tools: npm, Vite, PowerShell for scripts
- Optional: Any realtime layer (WebSocket / Socket.io) depending on chat implementation

Setup & Installation (explicit, step-by-step)

Follow these exact steps on Windows (PowerShell) to run the project locally.

1. Prerequisites

	- Install Node.js 18+ (LTS recommended). Verify with:

	```powershell
	node -v
	npm -v
	```

	- Have a MongoDB instance available (local or Atlas). Copy the connection string.

2. Backend install & env

	```powershell
	cd .\Backend
	npm install
	copy .env-copy .env
	# Edit Backend/.env and set MONGODB_URI and other values (PORT, JWT_SECRET)
	```

3. Frontend install

	```powershell
	cd ..\Frontend
	npm install
	```

4. Start servers (two terminals recommended)

	Terminal A:
	```powershell
	cd .\Backend
	npm run dev   # or `node app.js`
	```

		Terminal B:
		```powershell
		cd .\Frontend
		npm run dev
		```

API cheat-sheet (useful for live demo)

Routes are defined under `Backend/routes`. Example endpoints (check the route files for exact paths and request shapes):

- GET /api/projects — list projects
- POST /api/projects — create project (body: title, description, skills, ownerId...)
- GET /api/users/:id — get user profile
- POST /api/users — create user/profile
- GET /api/skills — list skills
- GET /api/notifications/:userId — fetch notifications
- POST /api/chat/message — send chat message (body: from, to, text)

Use these during the demo with the frontend UI or a simple curl/Powershell request to show backend functionality.

Troubleshooting quick wins

- If backend can't connect to MongoDB — verify `MONGODB_URI` and network access.
- If CORS errors in browser — ensure backend CORS allows `http://localhost:5173`.
- If ports are busy — change `PORT` in `.env` or stop the conflicting service.

Optional extras I can add now.
- `POSTMAN_COLLECTION.json` or example curl/pwsh requests for key endpoints.
- `CONTRIBUTING.md`, `ISSUE_TEMPLATE.md` for quick collaboration.

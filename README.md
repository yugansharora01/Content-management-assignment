# CMS Microservices Dashboard

A full-stack content management dashboard with a microservices backend, Redis integration, real-time notifications, and a React frontend.

---

## 🧰 Prerequisites

Before starting, make sure you have the following installed:

| Tool | Version | Purpose |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | Run all backend services |
| [Node.js](https://nodejs.org/) | 20+ | Run the frontend dev server |
| [Git](https://git-scm.com/) | Any | Clone the repo |

---

## ⚡ Full Setup — Step by Step

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd CMS-design-assignment
```

---

### Step 2 — Create your `.env` file

Copy the example and fill in the required values:

```bash
cp .env.example .env
```

Then open `.env` and set the following (minimum required values to run locally):

```env
NODE_ENV=development

# Ports (defaults are fine for local)
AUTH_SERVICE_PORT=4001
CONTENT_SERVICE_PORT=4002
NOTIFICATION_SERVICE_PORT=4003
REPORT_SERVICE_PORT=4004
AUDIT_SERVICE_PORT=4005
API_GATEWAY_PORT=3000
FRONTEND_PORT=3001

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_TTL=3600

# MongoDB (uses the mongo container)
MONGO_URI=mongodb://mongo:27017/cms

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Email (optional — reports won't email if left blank)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=yourpassword
EMAIL_FROM=noreply@cms.com
EMAIL_TO=admin@cms.com
```

> **Note:** `REDIS_HOST=redis` and `MONGO_URI=mongodb://mongo:27017/cms` use the Docker service names — keep them as-is for local Docker runs.

---

### Step 3 — Start the backend (Docker Compose)

From the **root** of the project:

```bash
docker compose up --build
```

This starts:
- `mongo` — MongoDB on port `27017`
- `redis` — Redis on port `6379`
- `api-gateway` — API Gateway on port `3000` ← **all requests go here**
- `auth-service` — port `4001`
- `content-service` — port `4002`
- `notification-service` — port `4003` (also serves WebSockets)
- `report-service` — port `4004`
- `audit-service` — port `4005`

Wait until you see all services log **"Server started"** or similar. This takes ~30–60s on first run as images are built.

> **Tip:** Add `-d` to run in the background: `docker compose up --build -d`

---

### Step 4 — Seed the admin user

The auth-service includes a seed script that creates the default admin account. Run it once after the containers are up:

```bash
docker compose exec auth-service node src/scripts/seed.js
```

Default credentials created:
| Field | Value |
|---|---|
| **Email** | `admin@cms.com` |
| **Password** | `admin123` |

---

### Step 5 — Start the frontend

Open a **new terminal**, then:

```bash
cd frontend
npm install
npm run dev
```

The dashboard is now available at: **[http://localhost:5173](http://localhost:5173)**

---

## ✅ Verify Everything is Running

| Service | URL | Expected Response |
|---|---|---|
| API Gateway (health) | `http://localhost:3000/health` | `{ "status": "ok" }` |
| Login endpoint | `POST http://localhost:3000/auth/login` | Returns JWT token |
| Frontend | `http://localhost:5173` | Shows login page |

Quick health check (run in terminal):
```bash
curl http://localhost:3000/health
```

---

## 🧪 Testing the API (Postman)

1. Open **Postman** (or import into any REST client)
2. Import the collection: `postman/cms-api-collection.json`
3. Set the collection variable `base_url` to `http://localhost:3000`
4. Run **Login** first → the collection auto-saves the JWT token
5. All other requests use that token automatically

**Test flow:**
```
Login → Create Content → List Content → Generate Report → Download Report → Check Audit Logs
```

---

## 🛑 Stopping Everything

```bash
# Stop all Docker services
docker compose down

# Stop and remove volumes (wipes DB data)
docker compose down -v
```

Stop the frontend with `Ctrl+C` in its terminal.

---

## 🛠 Project Architecture

### Services & Ports

| Service | Port | Description |
|---|---|---|
| **API Gateway** | `3000` | Entry point — JWT auth, routing, rate limiting |
| **Auth Service** | `4001` | Login / logout / session management |
| **Content Service** | `4002` | CRUD for content articles (Redis-cached) |
| **Notification Service** | `4003` | Real-time alerts via WebSockets (Socket.io) |
| **Report Service** | `4004` | PDF generation, email delivery, cron scheduling |
| **Audit Service** | `4005` | Centralized action logs |
| **MongoDB** | `27017` | Primary database |
| **Redis** | `6379` | Token blocklist, caching, rate limiting |

### Redis Usage
- **Token blocklist** — Invalidated JWTs are stored in Redis so logout takes immediate effect
- **Content caching** — Content list responses are cached with a configurable TTL
- **Rate limiting** — API Gateway uses Redis to enforce per-IP request limits

---

## 🚀 Zero Downtime Deployment (Blue-Green)

The `Jenkinsfile` implements a Blue-Green strategy:
1. Build new ("Green") Docker images tagged `1.0.<BUILD_NUMBER>`
2. Deploy with `docker-compose up -d --build` (rolling replacement)
3. **Smoke Test** — hits `GET /health` to verify the new containers work
4. **Auto-Rollback** — if smoke test fails, the previous version tag is re-deployed automatically
5. On success, old images are pruned

See [`ci-cd/README.md`](./ci-cd/README.md) for the full pipeline breakdown.

---

## 📄 Documentation

| Resource | Location |
|---|---|
| Architecture diagrams | [`/architecture/system-design.md`](./architecture/system-design.md) |
| Request flow details | [`/architecture/system-architecture.md`](./architecture/system-architecture.md) |
| Postman collection | [`/postman/cms-api-collection.json`](./postman/cms-api-collection.json) |
| CI/CD pipeline docs | [`/ci-cd/README.md`](./ci-cd/README.md) |
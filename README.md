# CMS Microservices Dashboard assignment

A full-stack content management dashboard built with a microservices backend, Redis integration, real-time notifications, and a premium Next.js frontend.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local testing)

### Setup & Run (Docker)
1. Clone the repository.
2. Ensure you have a `.env` file in the root (see `.env.example`).
3. Run the complete stack:
   ```bash
   docker-compose up --build
   ```
4. Access the **API Gateway** at `http://localhost:3000`.
5. Access the **Frontend Dashboard** (run separately as per user strategy):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3001`.

## 🛠 Project Architecture

### Microservices
- **API Gateway (Port 3000)**: Entry point for all requests. Handles routing, JWT verification with Redis blocklisting, and rate limiting.
- **Auth Service (Port 4001)**: User login/logout and session management.
- **Content Service (Port 4002)**: CRUD operations for articles with Redis caching.
- **Notification Service (Port 4003)**: Real-time alerts via WebSockets.
- **Report Service (Port 4004)**: Generates PDF reports and sends email notifications.
- **Audit Service (Port 4005)**: Centralized logging for all system activity.

### Infrastructure
- **MongoDB**: Primary persistent storage.
- **Redis**: Token blocklisting, API rate limiting, and content caching.

## 🚀 Zero Downtime Deployment (Blue-Green)

The system is designed for high availability during deployments:

1.  **Blue-Green Concept**: We maintain two identical environments. The `Jenkinsfile` triggers a build of the new version ("Green") while the "Blue" version is still serving traffic.
2.  **Health Checks**: Once the Green containers are up, health checks are performed.
3.  **Traffic Switching**: The API Gateway (acting as a reverse proxy) is updated to point to the new container IDs.
4.  **Automatic Rollback**: If the new containers fail health checks, Jenkins aborts the deployment, keeping the old ("Blue") version running.
5.  **Implementation**: In this setup, we use `docker-compose up -d --build` which performs a rolling update, replacing containers one by one to ensure zero-downtime at the service level.

## 📦 Features
- **Premium UI**: Modern Dashboard built with Next.js 16 and HeroUI.
- **Security**: JWT authentication with instant revocation (Redis blocklist).
- **Real-time**: Live system notifications using Socket.io.
- **Automation**: Daily scheduled reports via Cron and manual triggers.
- **DevOps**: Complete `Jenkinsfile` for CI/CD with Blue-Green deployment strategy.

## 📄 Documentation
- **Architecture**: See `/architecture/system-design.md`
- **Postman Collection**: Found in `/postman/cms-api-collection.json`
- **API Details**: See `/architecture/system-architecture.md`

## 🧪 Testing
Use the provided Postman collection to test individual microservices through the API Gateway. 
Default Admin Credentials:
- **Email**: `admin@cms.com`
- **Password**: `admin123`
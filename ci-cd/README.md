# CI/CD Pipeline

This directory contains supplementary CI/CD documentation. The main pipeline definition is the [`Jenkinsfile`](../Jenkinsfile) at the root of the repository.

## Pipeline Overview

```
Install Dependencies → Lint → Run Tests → Build & Tag Docker Images → Deploy → Smoke Test → (Rollback if needed) → Cleanup
```

## Stages

| Stage | Description |
|---|---|
| **Install Dependencies** | Runs `npm install` for all microservices and the API Gateway |
| **Lint** | Runs `npm run lint` across all services (non-blocking) |
| **Run Tests** | Runs `npm test` in each service |
| **Build & Tag Docker Images** | Builds Docker images and tags them with `1.0.<BUILD_NUMBER>` and `latest` |
| **Deploy (Blue-Green)** | Runs `docker-compose up -d --build` — replaces containers one-by-one for zero-downtime |
| **Smoke Test** | Hits `GET /health` on the API Gateway; triggers rollback if it fails |
| **Rollback** | Re-tags the previous version as `latest` and redeploys — only runs on failure |
| **Cleanup** | Prunes unused Docker images |

## Zero Downtime Strategy

We use a **Blue-Green** approach:
1. Build new ("Green") containers
2. `docker-compose up -d` replaces containers one-by-one (keep old "Blue" alive until each new one is healthy)
3. Smoke test validates the new stack
4. On failure → rollback to the previous tagged version

## Email Notifications

- **On success**: Optionally sends a success email (commented out in Jenkinsfile, enable by uncommenting)
- **On failure**: Automatically sends an email to `ADMIN_EMAIL` with the failed stage name and Jenkins build URL

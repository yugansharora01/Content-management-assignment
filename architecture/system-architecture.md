# System Architecture

## Overview

This project implements a **Content Management Dashboard** built using a **microservices architecture**.

The system includes:

- Frontend Dashboard
- API Gateway
- Multiple backend services
- Redis for caching and queues
- MongoDB database
- Worker service for async tasks
- Docker-based infrastructure

The goal is to simulate a **real-world production system architecture** while keeping implementation manageable.

---

# High-Level Architecture

```mermaid
flowchart TD

Client[Frontend Dashboard - React]

Gateway[API Gateway]

Auth[Auth Service]
Content[Content Service]
Report[Report Service]
Audit[Audit Service]
Notification[Notification Service]

Worker[Background Worker]

Redis[(Redis)]
DB[(MongoDB)]

Email[Email Service]
PDF[PDF Generator]

Client --> Gateway

Gateway --> Auth
Gateway --> Content
Gateway --> Report
Gateway --> Audit
Gateway --> Notification

Auth --> Redis
Auth --> DB

Content --> DB
Content --> Redis

Report --> Worker
Worker --> PDF
Worker --> Email
Worker --> DB

Notification --> Redis

Audit --> DB
```
# Docker Deployment & Architecture Guide

A production-grade, enterprise Docker configuration for the **CareGuide Backend API**, engineered according to modern container security and performance best practices.

---

## 🏗️ Architecture Overview

The containerized stack consists of 3 services communicating over an isolated bridge network (`careguide-network`):

```
                       +-----------------------------------+
                       |      Host / Load Balancer         |
                       |       (Port 5000 / 443)           |
                       +-----------------+-----------------+
                                         |
                                         v
                         +-------------------------------+
                         |   careguide-api (Node.js 20)  |
                         |   - Multi-stage Alpine image  |
                         |   - Non-root user (node)      |
                         |   - dumb-init PID 1 supervisor|
                         |   - Healthcheck: /health      |
                         +---------------+---------------+
                                         |
                     +-------------------+-------------------+
                     |                                       |
                     v                                       v
     +-------------------------------+       +-------------------------------+
     |   careguide-mongodb (Mongo 7) |       |   careguide-redis (Redis 7)   |
     |   - Port 27017                |       |   - Port 6379                 |
     |   - Named persistent volume   |       |   - Named persistent volume   |
     |   - mongosh ping healthcheck  |       |   - BullMQ asynchronous queues|
     +-------------------------------+       +-------------------------------+
```

---

## 🛡️ Senior Developer Best Practices Implemented

| Security / Performance Feature | How It Is Implemented |
|---|---|
| **Multi-Stage Build** | 3 isolated build stages (`deps` -> `builder` -> `runner`) ensures build tools, devDependencies, and raw TypeScript source are excluded from the runtime container. |
| **Minimal Base Image** | Built on official `node:20-alpine`, keeping the final image size extremely small and drastically reducing CVE vulnerability surface. |
| **Non-Root Execution** | Runs under the unprivileged `node` user (`UID 1000`) instead of `root`, preventing container escape escalation vulnerabilities. |
| **PID 1 Signal Handling** | Uses `dumb-init` as the container init entrypoint. Properly handles `SIGTERM` and `SIGINT` signals for zero-downtime, graceful process termination. |
| **Container Healthchecks** | Docker natively checks `/health` via `curl` with configured timeout, interval, and retries. Orchestrators know when the service is truly ready. |
| **Dependency-Aware Boot** | API waits for MongoDB and Redis to pass their respective health checks (`condition: service_healthy`) before booting up. |
| **AOF Persistence** | Redis is initialized with `--appendonly yes` to safeguard BullMQ background job state against unexpected restarts. |
| **Strict `.dockerignore`** | Excludes `.env`, local `node_modules`, test artifacts, Git history, and build caches from leaking into image layers. |

---

## 🚀 Quick Start

### 1. Configure Environment

Copy the template environment file:

```bash
cp .env.example .env
```

Ensure `DATABASE_URL` and `REDIS_HOST` are set appropriately:
- When using the full Docker Compose stack:
  ```env
  DATABASE_URL=mongodb://mongodb:27017/careguide_backend
  REDIS_HOST=redis
  ```
- When pointing to MongoDB Atlas or an external database, provide your cloud URI.

---

### 2. Production / Staging Deployment

Build and spin up the complete stack in detached mode:

```bash
docker compose up -d --build
```

View real-time aggregated logs:
```bash
docker compose logs -f api
```

Check container status and health:
```bash
docker compose ps
```

Stop the stack gracefully:
```bash
docker compose down
```

To stop and wipe database volumes (clean reset):
```bash
docker compose down -v
```

---

### 3. Local Development with Hot-Reload

For active local development inside Docker with instant code reload on changes:

```bash
docker compose -f docker-compose.dev.yml up --build
```

Edits to `./src` on your host machine will immediately trigger `ts-node-dev` reloads inside the container.

---

## 🧪 Running Commands Inside Containers

### Seed Test Notes
```bash
docker compose exec api npm run seed:notes
```

### Access MongoDB Shell
```bash
docker compose exec mongodb mongosh careguide_backend
```

### Access Redis CLI
```bash
docker compose exec redis redis-cli
```

### Inspect Container Health Endpoint
```bash
curl http://localhost:5000/health
```
Response:
```json
{
  "status": "ok",
  "uptime": 124,
  "timestamp": "2026-09-06T10:45:00.000Z"
}
```

---

## 📦 Standalone Docker Image Build

If you are pushing to an image registry (Docker Hub, AWS ECR, GCP Artifact Registry, GitHub Packages):

```bash
# Build standalone image
docker build -t careguide-backend:latest .

# Run standalone container with external database
docker run -d \
  --name careguide-api \
  -p 5000:5000 \
  --env-file .env \
  careguide-backend:latest
```

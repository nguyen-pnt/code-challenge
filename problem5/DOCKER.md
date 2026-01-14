# Docker Setup

Run the Express.js CRUD API in a container using multi-stage build (Alpine-based, ~150MB).

## Quick Start

**Docker Compose:**

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

**Docker CLI:**

```bash
docker build -t express-crud-api .
docker run -d -p 3000:3000 --name express-crud-api express-crud-api
docker logs -f express-crud-api
```

API available at `http://localhost:3000`

## Configuration

Set environment variables in `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - PORT=3000
  - LOG_LEVEL=info
```

## Build Details

- Multi-stage build (builder + production)
- Alpine Linux base image
- Production dependencies only
- Health check endpoint: `/health`

## Troubleshooting

```bash
# View logs
docker-compose logs

# Rebuild
docker-compose up --build -d
```

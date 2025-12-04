# Docker Setup for KH-App

This guide explains how to run the KH-App using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration values.

### 2. Run in Production Mode

Build and start all services:

```bash
docker-compose up -d --build
```

This will start:
- **MongoDB** on port `27017`
- **Backend API** on port `4000`
- **Frontend** on port `3000`
- **Admin Dashboard** on port `3001`

### 3. Run in Development Mode

For development with hot-reloading:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Development ports:
- **MongoDB** on port `27017`
- **Backend API** on port `4000`
- **Frontend** on port `5173`
- **Admin Dashboard** on port `5174`

## Accessing the Application

| Service | Production URL | Development URL |
|---------|---------------|-----------------|
| Frontend | http://localhost:3000 | http://localhost:5173 |
| Admin Dashboard | http://localhost:3001 | http://localhost:5174 |
| Backend API | http://localhost:4000 | http://localhost:4000 |
| API Documentation | http://localhost:4000/api-docs | http://localhost:4000/api-docs |

## Common Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f admin-doc
docker-compose logs -f mongodb
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (reset database)
```bash
docker-compose down -v
```

### Rebuild a specific service
```bash
docker-compose up -d --build backend
```

### Access MongoDB shell
```bash
docker exec -it kh-app-mongodb mongosh -u admin -p password123
```

### Access a container shell
```bash
docker exec -it kh-app-backend sh
docker exec -it kh-app-frontend sh
docker exec -it kh-app-admin sh
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Frontend   │  │  Admin-Doc   │  │   Backend    │       │
│  │   (React)    │  │   (React)    │  │  (Express)   │       │
│  │  Port: 3000  │  │  Port: 3001  │  │  Port: 4000  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│                    ┌──────▼───────┐                          │
│                    │   MongoDB    │                          │
│                    │  Port: 27017 │                          │
│                    └──────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Port already in use
If a port is already in use, you can change it in the `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change host port (left side)
```

### MongoDB connection issues
1. Ensure MongoDB container is healthy:
   ```bash
   docker-compose ps
   ```
2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

### Build failures
Clear Docker cache and rebuild:
```bash
docker-compose build --no-cache
```

### Container keeps restarting
Check the logs for errors:
```bash
docker-compose logs -f <service-name>
```

## Using External MongoDB (MongoDB Atlas)

If you want to use MongoDB Atlas instead of the Docker MongoDB:

1. Comment out or remove the `mongodb` service in `docker-compose.yml`
2. Update the `MONGODB_URI` in your `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```
3. Remove the `depends_on` for mongodb in the backend service

## Production Deployment

For production deployment, consider:

1. **Use proper secrets management** - Don't commit `.env` files
2. **Set up SSL/TLS** - Use a reverse proxy like Nginx or Traefik
3. **Enable MongoDB authentication** - Use strong passwords
4. **Set resource limits** - Add memory and CPU limits to containers
5. **Use Docker Swarm or Kubernetes** - For orchestration and scaling

### Example with resource limits:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

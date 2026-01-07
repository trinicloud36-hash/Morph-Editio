# Docker Setup Guide

## Overview

This project includes complete Docker configuration for both development and production environments.

## Files Included

- **Dockerfile** - Multi-stage production build
- **Dockerfile.dev** - Development image with hot reload
- **docker-compose.yml** - Production deployment
- **docker-compose.dev.yml** - Development environment
- **nginx.conf** - Production reverse proxy configuration
- **.dockerignore** - Docker build optimization

## Quick Start

### Development with Hot Reload

```bash
docker-compose -f docker-compose.dev.yml up
```

Access at: http://localhost:3000

### Production Build and Run

```bash
docker-compose up
```

Access at: http://localhost or http://localhost:3000

## Detailed Usage

### Development Environment

```bash
# Start development server with hot reload
docker-compose -f docker-compose.dev.yml up

# Build only
docker-compose -f docker-compose.dev.yml build

# Stop containers
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

**Features:**
- ✅ Hot reload on file changes
- ✅ Volume mounts for live development
- ✅ Development database (SQLite)
- ✅ Debug capabilities

### Production Environment

```bash
# Start all services (app + nginx)
docker-compose up -d

# Build production image
docker build -t morph-editio:latest .

# Run container manually
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -v ./prisma:/app/prisma \
  --name morph-editio \
  morph-editio:latest

# View logs
docker logs -f morph-editio

# Stop container
docker stop morph-editio
docker rm morph-editio
```

**Features:**
- ✅ Multi-stage build (optimized size)
- ✅ Non-root user for security
- ✅ Health checks
- ✅ Signal handling (dumb-init)
- ✅ Nginx reverse proxy
- ✅ Gzip compression
- ✅ Rate limiting

## Image Details

### Production Image (`Dockerfile`)

**Base Image:** `node:18-alpine`

**Stages:**
1. **dependencies** - Install production dependencies
2. **builder** - Build the application
3. **runtime** - Lean production image

**Size:** ~180MB (optimized)

**Features:**
- Non-root user (nodejs:1001)
- Health check endpoint
- Proper signal handling
- Production-ready configuration

### Development Image (`Dockerfile.dev`)

**Base Image:** `node:18-alpine`

**Size:** ~400MB

**Features:**
- Volume mounts for live editing
- npm run dev for hot reload
- Development dependencies included

## Docker Compose Services

### Production (`docker-compose.yml`)

**Services:**
1. **app** - Next.js application
   - Port: 3000
   - Health checks enabled
   - Auto-restart

2. **nginx** - Reverse proxy
   - Port: 80 (and 443 for HTTPS)
   - Load balancing
   - Gzip compression
   - Rate limiting

### Development (`docker-compose.dev.yml`)

**Services:**
1. **app** - Development server
   - Port: 3000
   - Live reload
   - Volume mounts

## Environment Variables

### Production

```bash
NODE_ENV=production
DATABASE_URL="file:./prisma/prod.db"
```

### Development

```bash
NODE_ENV=development
DATABASE_URL="file:./prisma/dev.db"
```

## Nginx Configuration

### Features

- **Reverse Proxy** - Routes requests to Next.js
- **Compression** - Gzip for text/JSON/JS
- **Rate Limiting** - 10 req/s for API, 30 req/s for general
- **Caching** - Static assets cached for 1 day
- **Security Headers** - X-Real-IP, X-Forwarded-For
- **WebSocket Support** - For real-time features

### HTTPS Setup (Optional)

1. Obtain SSL certificates (Let's Encrypt, etc.)
2. Place in `./certs/` directory
3. Uncomment HTTPS section in nginx.conf
4. Update server_name

```bash
certbot certonly --standalone -d your-domain.com
```

## Health Checks

### Container Health

```bash
# Check container status
docker ps | grep morph-editio

# Get detailed health status
docker inspect morph-editio
```

### Endpoints

- **Health** - `GET /health` - Returns 200 if running
- **API** - `GET /api` - API endpoint

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Rebuild image
docker-compose build --no-cache

# Start with verbose output
docker-compose up --verbose
```

### Port already in use

```bash
# Find process using port
lsof -i :3000

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Map to different port
```

### Database issues

```bash
# Reset database
docker-compose exec app rm prisma/dev.db

# Re-run migrations
docker-compose exec app npm run db:migrate
```

### Nginx errors

```bash
# Check nginx config
docker-compose exec nginx nginx -t

# View nginx logs
docker-compose logs nginx
```

## Performance Optimization

### Build Optimization

- Multi-stage build reduces final image size
- Alpine Linux base (small footprint)
- Production dependencies only
- Node modules cached during build

### Runtime Optimization

- Nginx reverse proxy with caching
- Gzip compression enabled
- Rate limiting to prevent abuse
- Health checks for reliability

## Security

### Best Practices Implemented

- ✅ Non-root user (nextjs:1001)
- ✅ Read-only filesystem where possible
- ✅ Minimal base image (Alpine)
- ✅ No unnecessary tools or packages
- ✅ Health checks for availability
- ✅ Rate limiting on API endpoints

### Additional Recommendations

1. Use environment variables for secrets
2. Scan images with tools like Trivy
3. Keep base images updated
4. Use private Docker registry
5. Implement resource limits

## Deployment

### Docker Hub

```bash
# Tag image
docker tag morph-editio:latest username/morph-editio:latest

# Push to registry
docker push username/morph-editio:latest

# Pull and run
docker pull username/morph-editio:latest
docker run -d -p 3000:3000 username/morph-editio:latest
```

### Kubernetes

See [Kubernetes manifests](./k8s/) for deployment configuration.

### Cloud Platforms

- **AWS ECS** - Use docker-compose format
- **Google Cloud Run** - Push to Artifact Registry
- **Azure Container Instances** - Use ACR registry
- **DigitalOcean** - Use Docker App Platform

## Useful Commands

```bash
# Build
docker build -t morph-editio:latest .
docker build -f Dockerfile.dev -t morph-editio:dev .

# Run
docker run -p 3000:3000 morph-editio:latest
docker exec -it container_id bash

# Compose
docker-compose up -d
docker-compose down
docker-compose ps
docker-compose logs -f

# Clean up
docker system prune -a
docker volume prune
docker rmi morph-editio:latest
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment/docker)
- [Nginx Documentation](https://nginx.org/en/docs/)

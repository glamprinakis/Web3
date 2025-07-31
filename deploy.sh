#!/bin/bash
set -ex  # Exit on any error and print commands being executed

echo "🚀 Starting deployment at $(date)"
echo "� Current directory: $(pwd)"
echo "👤 Running as user: $(whoami)"
echo "🐋 Docker version: $(docker --version)"
echo "🔧 Docker Compose version: $(docker compose version)"

# Check if required environment variables are set
if [ -z "$DB_PASSWORD" ]; then
    echo "❌ DB_PASSWORD environment variable is not set!"
    exit 1
fi

echo "📦 Pulling Docker images..."
docker compose -f docker-compose.prod.yml pull

echo "🏗️ Building React frontend..."
docker compose -f docker-compose.prod.yml run --rm frontend-builder

echo "🚀 Starting all services..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

echo "📋 Docker containers after startup:"
docker ps -a

# Get container IDs for monitoring
export DB_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q db)
export BACKEND_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q backend)
export PROXY_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q proxy)

echo "⏳ Waiting for services to start..."
sleep 10  # Give services time to initialize

echo "Checking if services are running..."
docker compose -f docker-compose.prod.yml ps

# Check if containers are running
if ! docker compose -f docker-compose.prod.yml ps | grep -q "backend.*Up"; then
    echo "❌ Backend container is not running!"
    docker compose -f docker-compose.prod.yml logs backend
    exit 1
fi

# Wait for MySQL to be ready
echo "Checking MySQL..."
for i in {1..30}; do
    if docker exec $DB_CONTAINER mysqladmin ping -h localhost -u root -p${DB_PASSWORD} --silent; then
        echo "✅ MySQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ MySQL failed to start! Showing logs:"
        docker logs $DB_CONTAINER
        exit 1
    fi
    echo "Waiting for MySQL... (attempt $i/30)"
    sleep 5
done

# Give backend some time to start after MySQL is ready
echo "Giving backend time to initialize..."
sleep 10

# Wait for the backend to be ready
echo "Checking Backend API..."
for i in {1..30}; do
    echo "Attempt $i/30: Checking backend health at http://localhost:3000/api/health..."
    if curl -v http://localhost:3000/api/health 2>&1; then
        echo "✅ Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed! Collecting debug information..."
        echo "=== Process List ==="
        ps aux | grep node
        echo "=== Network Status ==="
        netstat -tulpn
        echo "=== Backend Logs ==="
        docker logs $BACKEND_CONTAINER
        echo "=== MySQL Logs ==="
        docker logs $DB_CONTAINER
        echo "=== Nginx Logs ==="
        docker logs $PROXY_CONTAINER
        echo "=== Docker Network Info ==="
        docker network inspect appnet
        exit 1
    fi
    echo "Waiting for Backend API... (attempt $i/30)"
    sleep 5
done

# Finally check if the proxy is working
echo "Checking Nginx proxy..."
for i in {1..15}; do
    echo "Attempt $i/15: Checking proxy at http://localhost/api/health..."
    if curl -v --connect-timeout 5 http://localhost/api/health 2>&1; then
        echo "✅ Proxy is ready"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Proxy health check failed! Collecting debug information..."
        echo "=== Nginx Configuration ==="
        docker exec $PROXY_CONTAINER cat /etc/nginx/conf.d/default.conf
        echo "=== Nginx Logs ==="
        docker logs $PROXY_CONTAINER
        echo "=== Backend Status ==="
        curl -v http://backend:3000/api/health 2>&1 || true
        exit 1
    fi
    echo "Waiting for proxy... (attempt $i/15)"
    sleep 5
done

echo "🧹 Cleaning up old Docker resources..."
docker image prune -f
docker container prune -f
docker network prune -f
docker volume prune -f

echo "📊 Final system status:"
echo "=== Docker Status ==="
docker system df
echo "=== Running Containers ==="
docker ps
echo "=== Container Logs Summary ==="
echo "--- Backend ---"
docker logs --tail 20 $BACKEND_CONTAINER
echo "--- MySQL ---"
docker logs --tail 20 $DB_CONTAINER
echo "--- Nginx ---"
docker logs --tail 20 $PROXY_CONTAINER

echo "✅ Deployment completed at $(date)"

#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting deployment..."

echo "📦 Building and starting services..."
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml run --rm frontend-builder
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

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
echo "Checking Backend..."
for i in {1..30}; do
    if curl -sf http://localhost/api/health; then
        echo "✅ Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend health check failed! Showing logs:"
        echo "=== Backend Logs ==="
        docker logs $BACKEND_CONTAINER
        echo "=== MySQL Logs ==="
        docker logs $DB_CONTAINER
        exit 1
    fi
    echo "Waiting for Backend API... (attempt $i/30)"
    sleep 5
done

echo "✅ Deployment complete and healthy!"

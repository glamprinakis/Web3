#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Create certbot directories if they don't exist
mkdir -p certbot/conf certbot/www

# Pull latest images and recreate containers
echo "📦 Pulling latest images..."
docker compose -f docker-compose.prod.yml pull

echo "🏗️ Building and starting services..."
docker compose -f docker-compose.prod.yml up -d --build --force-recreate

# Get container IDs for monitoring
export DB_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q db)
export BACKEND_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q backend)
export PROXY_CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q proxy)

# Initialize SSL certificates if they don't exist
if [ ! -d "certbot/conf/live/glamprinakis.com" ]; then
    echo "🔒 Initializing SSL certificates..."
    docker compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot --webroot-path /var/www/certbot \
        -d glamprinakis.com -d www.glamprinakis.com \
        --register-unsafely-without-email --agree-tos
fi

echo "✅ Deployment script completed"

#!/bin/bash
# Local development setup script

echo "🚀 Starting local development environment..."

# Build and start all services locally
docker compose up -d --build

echo "✅ Services started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "💾 Database: localhost:3306"
echo "🔍 PhpMyAdmin: http://localhost:8000"

echo ""
echo "📝 To stop: docker compose down"
echo "📊 To view logs: docker compose logs -f"

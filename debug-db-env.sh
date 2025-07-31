#!/bin/bash
echo "🔍 Database Container Debug Information"
echo "======================================"

echo "📦 Docker containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"

echo ""
echo "🔍 Database container environment variables:"
docker exec web3-db-1 env | grep -E "(MYSQL_|DB_)" | sort || echo "❌ Could not read db container env vars"

echo ""
echo "🔍 Backend container environment variables:"
docker exec web3-backend-1 env | grep -E "(MYSQL_|DB_)" | sort || echo "❌ Could not read backend container env vars"

echo ""
echo "🔍 Docker compose effective configuration:"
docker compose -f docker-compose.prod.yml config | grep -A 15 -B 5 "environment:"

echo ""
echo "🔍 Current .env file content:"
cat .env 2>/dev/null || echo "❌ No .env file found"

echo ""
echo "🔍 Docker volumes:"
docker volume ls | grep mysql

echo ""
echo "💡 DIAGNOSIS:"
echo "   - If DB container has different MYSQL_ROOT_PASSWORD than backend DB_PASSWORD"
echo "   - Then the volume was created with a different password"
echo "   - Solution: Reset volume with ./reset-db-volume.sh"

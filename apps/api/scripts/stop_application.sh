#!/bin/bash
set -e

if command -v docker-compose >/dev/null 2>&1; then
	DOCKER_COMPOSE_CMD="docker-compose"
else
	DOCKER_COMPOSE_CMD="docker compose"
fi

echo "Stopping application..."

# Navigate to application directory
cd /var/app/current || exit 0

# Stop docker-compose services if they exist
if [ -f docker-compose.prod.yml ]; then
	echo "Stopping Docker Compose services..."
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down || true
else
	echo "No docker-compose.prod.yml found, skipping..."
fi

echo "Application stopped successfully"

#!/bin/bash
set -e

if command -v docker-compose >/dev/null 2>&1; then
	DOCKER_COMPOSE_CMD="docker-compose"
else
	DOCKER_COMPOSE_CMD="docker compose"
fi

echo "Starting application..."

# Navigate to application directory
cd /var/app/current

# Verify .env file exists (created by setup_env.sh)
if [ ! -f .env ]; then
	echo "ERROR: .env file not found"
	exit 1
fi

# Start docker-compose services with .env file
if [ -f docker-compose.prod.yml ]; then
	echo "Starting Docker Compose services..."
	echo "Using environment file: .env"

	# Docker Compose automatically loads .env file from the current directory
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d

	# Wait for container to be healthy
	echo "Waiting for container to be ready..."
	sleep 5
else
	echo "ERROR: docker-compose.prod.yml not found!"
	exit 1
fi

echo "Application started successfully"

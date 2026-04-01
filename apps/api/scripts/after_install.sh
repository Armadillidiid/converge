#!/bin/bash
set -e

if command -v docker-compose >/dev/null 2>&1; then
	DOCKER_COMPOSE_CMD="docker-compose"
else
	DOCKER_COMPOSE_CMD="docker compose"
fi

echo "Running after install tasks..."

# Navigate to application directory
cd /var/app/current

# Ensure scripts are executable
chmod +x scripts/*.sh

echo "Checking disk usage before pull..."
df -h

echo "Cleaning old Docker artifacts to free disk space..."
# Safe cleanup: do not prune volumes so Postgres/Redis data remains intact.
docker container prune -f || true
docker image prune -a -f || true
docker builder prune -a -f || true
docker network prune -f || true

echo "Disk usage after cleanup..."
df -h

# Load infrastructure environment variables (AWS_REGION, ECR_REPOSITORY)
if [ -f .env.infra ]; then
	echo "Loading infrastructure environment variables..."
	set -a # automatically export all variables
	source .env.infra
	set +a
else
	echo "ERROR: .env.infra file not found"
	exit 1
fi

# Login to ECR to pull the Docker image
if [ -n "$AWS_REGION" ] && [ -n "$ECR_REPOSITORY" ]; then
	ECR_REGISTRY="${ECR_REGISTRY:-${ECR_REPOSITORY%%/*}}"

	echo "Logging in to Amazon ECR..."
	echo "Region: ${AWS_REGION}"
	echo "Repository: ${ECR_REPOSITORY}"
	echo "Registry: ${ECR_REGISTRY}"
	aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin "${ECR_REGISTRY}"
else
	echo "ERROR: AWS_REGION or ECR_REPOSITORY not set in .env file"
	exit 1
fi

# Pull the latest Docker image
if [ -f docker-compose.prod.yml ]; then
	echo "Pulling Docker images..."
	# Pull app images first (largest), then the rest.
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml pull api worker
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml pull caddy redis postgres mailpit
fi

# Clean up dangling images
echo "Cleaning up dangling Docker images..."
docker image prune -f || true

echo "After install completed successfully"

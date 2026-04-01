#!/bin/bash
set -euo pipefail

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

	# Start stateful dependencies first so migrations can run.
	echo "[startup] Starting postgres and redis..."
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d postgres redis

	# Wait for postgres readiness before running migrations.
	echo "[db-wait] Waiting for postgres to become ready..."
	MAX_WAIT=120
	WAITED=0
	until $DOCKER_COMPOSE_CMD -f docker-compose.prod.yml exec -T postgres sh -lc 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1'; do
		if [ "$WAITED" -ge "$MAX_WAIT" ]; then
			echo "ERROR: Postgres did not become ready within ${MAX_WAIT}s"
			exit 1
		fi

		sleep 2
		WAITED=$((WAITED + 2))
		echo "[db-wait] Still waiting... (${WAITED}/${MAX_WAIT}s)"
	done
	echo "[db-wait] Postgres is ready"

	# Migrations are currently configured for postgres DB_URL mode.
	if ! grep -q '^DB_DRIVER=postgres$' .env; then
		echo "ERROR: DB migrations currently support DB_DRIVER=postgres in deployment flow"
		exit 1
	fi

	# Run DB migrations before starting application services.
	echo "[migrate] Running database migrations..."
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml run --rm api sh -lc 'cd packages/database && node ./node_modules/drizzle-kit/bin.cjs migrate --config ./drizzle.config.ts'
	echo "[migrate] Migrations completed"

	# Docker Compose automatically loads .env file from the current directory
	echo "[startup] Starting all services..."
	$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d

	# Wait for container to be healthy
	echo "Waiting for container to be ready..."
	sleep 5
else
	echo "ERROR: docker-compose.prod.yml not found!"
	exit 1
fi

echo "Application started successfully"

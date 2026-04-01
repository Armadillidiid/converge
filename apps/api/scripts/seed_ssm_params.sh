#!/bin/bash
set -e

usage() {
	cat <<'EOF'
Usage: seed_ssm_params.sh --env-file <path> [options]

Options:
  --env-file <path>   Source env file with KEY=VALUE pairs (required)
  --app-name <name>   App name path segment (default: converge)
  --env-name <name>   Environment path segment (default: prod)
  --region <region>   AWS region (default: AWS_REGION or AWS_DEFAULT_REGION)
  --dry-run           Print actions without writing to SSM
  --no-overwrite      Do not overwrite existing SSM parameters
  --help              Show this help

Example:
  ./apps/api/scripts/seed_ssm_params.sh \
    --env-file /tmp/converge.prod.env \
    --region eu-west-2
EOF
}

APP_NAME="converge"
ENV_NAME="prod"
ENV_FILE=""
DRY_RUN="false"
OVERWRITE="true"
REGION="${AWS_REGION:-${AWS_DEFAULT_REGION:-}}"

while [ $# -gt 0 ]; do
	case "$1" in
	--env-file)
		ENV_FILE="$2"
		shift 2
		;;
	--app-name)
		APP_NAME="$2"
		shift 2
		;;
	--env-name)
		ENV_NAME="$2"
		shift 2
		;;
	--region)
		REGION="$2"
		shift 2
		;;
	--dry-run)
		DRY_RUN="true"
		shift 1
		;;
	--no-overwrite)
		OVERWRITE="false"
		shift 1
		;;
	--help)
		usage
		exit 0
		;;
	*)
		echo "ERROR: Unknown option '$1'"
		usage
		exit 1
		;;
	esac
done

if [ -z "$ENV_FILE" ]; then
	echo "ERROR: --env-file is required"
	usage
	exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
	echo "ERROR: env file not found: $ENV_FILE"
	exit 1
fi

if [ -z "$REGION" ]; then
	echo "ERROR: --region is required (or set AWS_REGION/AWS_DEFAULT_REGION)"
	exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
	echo "ERROR: aws CLI not found in PATH"
	exit 1
fi

declare -A params

while IFS= read -r raw_line || [ -n "$raw_line" ]; do
	line="${raw_line%$'\r'}"
	line="${line#${line%%[![:space:]]*}}"
	line="${line%${line##*[![:space:]]}}"

	if [ -z "$line" ] || [ "${line#\#}" != "$line" ]; then
		continue
	fi

	if [[ "$line" == export* ]]; then
		line="${line#export }"
	fi

	if [[ "$line" != *=* ]]; then
		continue
	fi

	key="${line%%=*}"
	value="${line#*=}"
	key="${key#${key%%[![:space:]]*}}"
	key="${key%${key##*[![:space:]]}}"

	if [ -n "$key" ]; then
		params["$key"]="$value"
	fi
done <"$ENV_FILE"

required_keys=(
	"NODE_ENV"
	"APP_PORT"
	"APP_PREFIX"
	"APP_FRONTEND_URL"
	"APP_BACKEND_URL"
	"APP_TRUSTED_ORIGINS"
	"DB_DRIVER"
	"REDIS_URL"
	"REDIS_CACHE_TTL"
	"SMTP_URL"
	"SMTP_FROM_EMAIL"
	"SMTP_FROM_NAME"
	"GOOGLE_CLIENT_ID"
	"GOOGLE_CLIENT_SECRET"
	"BETTER_AUTH_SECRET"
	"BETTER_AUTH_URL"
	"OPENAI_API_KEY"
	"OPENAI_BASE_URL"
	"POSTGRES_USER"
	"POSTGRES_PASSWORD"
	"POSTGRES_DB"
	"BULL_BOARD_PASSWORD"
	"MAILPIT_BASIC_AUTH_USER"
	"MAILPIT_BASIC_AUTH_PASSWORD_HASH"
)

missing=()
for key in "${required_keys[@]}"; do
	if [ -z "${params[$key]:-}" ]; then
		missing+=("$key")
	fi
done

db_driver="${params[DB_DRIVER]:-}"
if [ "$db_driver" = "postgres" ]; then
	if [ -z "${params[DB_URL]:-}" ]; then
		missing+=("DB_URL")
	fi
elif [ "$db_driver" = "aurora-data-api" ]; then
	for key in DB_DATABASE DB_SECRET_ARN DB_RESOURCE_ARN; do
		if [ -z "${params[$key]:-}" ]; then
			missing+=("$key")
		fi
	done
else
	missing+=("DB_DRIVER(valid: postgres|aurora-data-api)")
fi

if [ ${#missing[@]} -gt 0 ]; then
	echo "ERROR: Missing required parameters in $ENV_FILE:"
	for key in "${missing[@]}"; do
		echo "  - $key"
	done
	exit 1
fi

is_sensitive() {
	local key="$1"
	case "$key" in
	*SECRET* | *PASSWORD* | *TOKEN* | *API_KEY* | DB_URL | REDIS_URL | SMTP_URL)
		return 0
		;;
	*)
		return 1
		;;
	esac
}

prefix="/${APP_NAME}/${ENV_NAME}"
echo "Seeding SSM parameters under: ${prefix}/"
echo "Region: ${REGION}"
echo "Dry run: ${DRY_RUN}"
echo "Overwrite: ${OVERWRITE}"

updated=0
for key in "${!params[@]}"; do
	value="${params[$key]}"
	name="${prefix}/${key}"
	type="String"
	if is_sensitive "$key"; then
		type="SecureString"
	fi

	if [ "$DRY_RUN" = "true" ]; then
		echo "[dry-run] ${name} (${type})"
		updated=$((updated + 1))
		continue
	fi

	if [ "$OVERWRITE" = "true" ]; then
		aws ssm put-parameter --region "$REGION" --name "$name" --type "$type" --value "$value" --overwrite >/dev/null
	else
		aws ssm put-parameter --region "$REGION" --name "$name" --type "$type" --value "$value" >/dev/null
	fi

	echo "[ok] ${name} (${type})"
	updated=$((updated + 1))
done

echo "Completed. Parameters processed: ${updated}"

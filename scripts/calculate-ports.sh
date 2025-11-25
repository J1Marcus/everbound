#!/bin/bash
# Script: calculate-ports.sh
# Description: Calculate dynamic ports based on PORT_OFFSET for multi-instance support
# Usage: ./calculate-ports.sh [options]
#
# Options:
#   --show, -s             Show calculated ports without updating .env
#   --quiet, -q            Suppress output (for use in other scripts)
#   --help                 Show this help message

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/docker/.env"

# Functions
function error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

function success() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${GREEN}✓ $1${NC}"
    fi
}

function info() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${BLUE}ℹ $1${NC}"
    fi
}

function warning() {
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${YELLOW}⚠ $1${NC}"
    fi
}

function show_help() {
    echo "Usage: ./calculate-ports.sh [options]"
    echo ""
    echo "Description:"
    echo "  Calculates service ports based on PORT_OFFSET for multi-instance support."
    echo "  Base ports are incremented by PORT_OFFSET to avoid conflicts."
    echo ""
    echo "Base Ports:"
    echo "  PostgreSQL:      5432"
    echo "  Kong HTTP:       8000"
    echo "  Kong HTTPS:      8443"
    echo "  Studio:          3000"
    echo "  MinIO API:       9000"
    echo "  MinIO Console:   9001"
    echo "  Redis:           6379"
    echo "  GoTrue:          9999"
    echo "  PostgREST:       3000"
    echo "  Realtime:        4000"
    echo "  Storage:         5000"
    echo "  Functions:       9000"
    echo "  Meta:            8080"
    echo ""
    echo "Options:"
    echo "  --show, -s             Show calculated ports without updating .env"
    echo "  --quiet, -q            Suppress output (for use in other scripts)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./calculate-ports.sh              # Calculate and update .env"
    echo "  ./calculate-ports.sh --show       # Show ports without updating"
    echo "  ./calculate-ports.sh --quiet      # Silent mode for scripts"
    exit 0
}

# Parse arguments
SHOW_ONLY=false
QUIET_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --show|-s)
            SHOW_ONLY=true
            shift
            ;;
        --quiet|-q)
            QUIET_MODE=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    error ".env file not found at $ENV_FILE. Please create it from .env.example"
fi

# Load environment variables
source "$ENV_FILE"

# Get PORT_OFFSET (default to 0)
PORT_OFFSET=${PORT_OFFSET:-0}

# Validate PORT_OFFSET is a number
if ! [[ "$PORT_OFFSET" =~ ^[0-9]+$ ]]; then
    error "PORT_OFFSET must be a number, got: $PORT_OFFSET"
fi

# Base ports
BASE_POSTGRES_PORT=5432
BASE_KONG_HTTP_PORT=8000
BASE_KONG_HTTPS_PORT=8443
BASE_STUDIO_PORT=3000
BASE_MINIO_PORT=9000
BASE_MINIO_CONSOLE_PORT=9001
BASE_REDIS_PORT=6379
BASE_GOTRUE_PORT=9999
BASE_POSTGREST_PORT=3000
BASE_REALTIME_PORT=4000
BASE_STORAGE_PORT=5000
BASE_FUNCTIONS_PORT=9000
BASE_META_PORT=8080

# Calculate ports
CALC_POSTGRES_PORT=$((BASE_POSTGRES_PORT + PORT_OFFSET))
CALC_KONG_HTTP_PORT=$((BASE_KONG_HTTP_PORT + PORT_OFFSET))
CALC_KONG_HTTPS_PORT=$((BASE_KONG_HTTPS_PORT + PORT_OFFSET))
CALC_STUDIO_PORT=$((BASE_STUDIO_PORT + PORT_OFFSET))
CALC_MINIO_PORT=$((BASE_MINIO_PORT + PORT_OFFSET))
CALC_MINIO_CONSOLE_PORT=$((BASE_MINIO_CONSOLE_PORT + PORT_OFFSET))
CALC_REDIS_PORT=$((BASE_REDIS_PORT + PORT_OFFSET))
CALC_GOTRUE_PORT=$((BASE_GOTRUE_PORT + PORT_OFFSET))
CALC_POSTGREST_PORT=$((BASE_POSTGREST_PORT + PORT_OFFSET))
CALC_REALTIME_PORT=$((BASE_REALTIME_PORT + PORT_OFFSET))
CALC_STORAGE_PORT=$((BASE_STORAGE_PORT + PORT_OFFSET))
CALC_FUNCTIONS_PORT=$((BASE_FUNCTIONS_PORT + PORT_OFFSET))
CALC_META_PORT=$((BASE_META_PORT + PORT_OFFSET))

# Display calculated ports
if [ "$QUIET_MODE" = false ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Port Calculation for PORT_OFFSET=${PORT_OFFSET}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    printf "%-20s %-10s -> %-10s\n" "Service" "Base Port" "Calculated"
    echo "────────────────────────────────────────────────"
    printf "%-20s %-10s -> %-10s\n" "PostgreSQL" "$BASE_POSTGRES_PORT" "$CALC_POSTGRES_PORT"
    printf "%-20s %-10s -> %-10s\n" "Kong HTTP" "$BASE_KONG_HTTP_PORT" "$CALC_KONG_HTTP_PORT"
    printf "%-20s %-10s -> %-10s\n" "Kong HTTPS" "$BASE_KONG_HTTPS_PORT" "$CALC_KONG_HTTPS_PORT"
    printf "%-20s %-10s -> %-10s\n" "Studio" "$BASE_STUDIO_PORT" "$CALC_STUDIO_PORT"
    printf "%-20s %-10s -> %-10s\n" "MinIO API" "$BASE_MINIO_PORT" "$CALC_MINIO_PORT"
    printf "%-20s %-10s -> %-10s\n" "MinIO Console" "$BASE_MINIO_CONSOLE_PORT" "$CALC_MINIO_CONSOLE_PORT"
    printf "%-20s %-10s -> %-10s\n" "Redis" "$BASE_REDIS_PORT" "$CALC_REDIS_PORT"
    printf "%-20s %-10s -> %-10s\n" "GoTrue" "$BASE_GOTRUE_PORT" "$CALC_GOTRUE_PORT"
    printf "%-20s %-10s -> %-10s\n" "PostgREST" "$BASE_POSTGREST_PORT" "$CALC_POSTGREST_PORT"
    printf "%-20s %-10s -> %-10s\n" "Realtime" "$BASE_REALTIME_PORT" "$CALC_REALTIME_PORT"
    printf "%-20s %-10s -> %-10s\n" "Storage" "$BASE_STORAGE_PORT" "$CALC_STORAGE_PORT"
    printf "%-20s %-10s -> %-10s\n" "Functions" "$BASE_FUNCTIONS_PORT" "$CALC_FUNCTIONS_PORT"
    printf "%-20s %-10s -> %-10s\n" "Meta" "$BASE_META_PORT" "$CALC_META_PORT"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Exit if show-only mode
if [ "$SHOW_ONLY" = true ]; then
    exit 0
fi

# Check if ports need updating
NEEDS_UPDATE=false

if [ "${POSTGRES_PORT:-}" != "$CALC_POSTGRES_PORT" ] || \
   [ "${KONG_HTTP_PORT:-}" != "$CALC_KONG_HTTP_PORT" ] || \
   [ "${STUDIO_PORT:-}" != "$CALC_STUDIO_PORT" ]; then
    NEEDS_UPDATE=true
fi

if [ "$NEEDS_UPDATE" = false ] && [ "$PORT_OFFSET" = "0" ]; then
    success "Ports are already up to date"
    exit 0
fi

# Backup .env file
BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
if [ "$QUIET_MODE" = false ]; then
    info "Backed up .env to $BACKUP_FILE"
fi

# Update .env file with calculated ports
info "Updating .env file with calculated ports..."

# Use sed to update port values
sed -i.tmp "s|^POSTGRES_PORT=.*|POSTGRES_PORT=${CALC_POSTGRES_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^KONG_HTTP_PORT=.*|KONG_HTTP_PORT=${CALC_KONG_HTTP_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^KONG_HTTPS_PORT=.*|KONG_HTTPS_PORT=${CALC_KONG_HTTPS_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^STUDIO_PORT=.*|STUDIO_PORT=${CALC_STUDIO_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^MINIO_PORT=.*|MINIO_PORT=${CALC_MINIO_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^MINIO_CONSOLE_PORT=.*|MINIO_CONSOLE_PORT=${CALC_MINIO_CONSOLE_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^REDIS_PORT=.*|REDIS_PORT=${CALC_REDIS_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^GOTRUE_PORT=.*|GOTRUE_PORT=${CALC_GOTRUE_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^POSTGREST_PORT=.*|POSTGREST_PORT=${CALC_POSTGREST_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^REALTIME_PORT=.*|REALTIME_PORT=${CALC_REALTIME_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^STORAGE_PORT=.*|STORAGE_PORT=${CALC_STORAGE_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^FUNCTIONS_PORT=.*|FUNCTIONS_PORT=${CALC_FUNCTIONS_PORT}|" "$ENV_FILE"
sed -i.tmp "s|^META_PORT=.*|META_PORT=${CALC_META_PORT}|" "$ENV_FILE"

# Clean up temp file
rm -f "${ENV_FILE}.tmp"

success ".env file updated with calculated ports"

if [ "$QUIET_MODE" = false ]; then
    echo ""
    info "Ports have been calculated and updated in .env"
    echo ""
    
    if [ "$PORT_OFFSET" != "0" ]; then
        warning "Remember to use these ports when accessing services:"
        echo "  Studio:      http://localhost:${CALC_STUDIO_PORT}"
        echo "  API Gateway: http://localhost:${CALC_KONG_HTTP_PORT}"
        echo "  Database:    localhost:${CALC_POSTGRES_PORT}"
        echo ""
    fi
fi

# Testing:
# 1. Set PORT_OFFSET=100 in .env
# 2. Run ./calculate-ports.sh
# 3. Verify ports are calculated correctly (base + 100)
# 4. Check .env file is updated
# 5. Test --show flag to display without updating
# 6. Test --quiet flag for silent operation
# Expected: Ports calculated correctly, .env updated, backup created
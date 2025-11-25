#!/bin/bash
# Script: start.sh
# Description: Start all Supabase services with validation and health checks
# Usage: ./start.sh [options]
#
# Options:
#   --prod, --production    Use production configuration
#   --build                 Rebuild images before starting
#   --no-validate          Skip pre-start validation
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

# Functions
function error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

function success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

function warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

function show_help() {
    echo "Usage: ./start.sh [options]"
    echo ""
    echo "Options:"
    echo "  --prod, --production    Use production configuration"
    echo "  --build                 Rebuild images before starting"
    echo "  --no-validate          Skip pre-start validation"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start.sh                    # Start with local config"
    echo "  ./start.sh --prod             # Start with production config"
    echo "  ./start.sh --build            # Rebuild and start"
    exit 0
}

# Parse arguments
USE_PROD=false
BUILD_IMAGES=false
SKIP_VALIDATION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --prod|--production)
            USE_PROD=true
            shift
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        --no-validate)
            SKIP_VALIDATION=true
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

# Change to docker directory
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f .env ]; then
    error ".env file not found. Please copy .env.example to .env and configure it."
fi

# Load environment variables
set -a
source .env
set +a

# Validate required environment variables
info "Validating environment configuration..."

REQUIRED_VARS=(
    "PROJECT_NAME"
    "POSTGRES_PASSWORD"
    "JWT_SECRET"
    "ANON_KEY"
    "SERVICE_ROLE_KEY"
    "MINIO_ROOT_PASSWORD"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [ "${!var}" = "<strong-random-password>" ] || [ "${!var}" = "<256-bit-secret>" ] || [ "${!var}" = "<jwt-token-with-anon-role>" ] || [ "${!var}" = "<jwt-token-with-service-role>" ]; then
        error "$var is not set or contains placeholder value. Please run: ../scripts/generate-secrets.sh"
    fi
done

success "Environment variables validated"

# Calculate ports if PORT_OFFSET is set
if [ -n "$PORT_OFFSET" ] && [ "$PORT_OFFSET" != "0" ]; then
    info "PORT_OFFSET detected: $PORT_OFFSET"
    info "Calculating dynamic ports..."
    
    # Run port calculation script if it exists
    if [ -f "$PROJECT_ROOT/scripts/calculate-ports.sh" ]; then
        bash "$PROJECT_ROOT/scripts/calculate-ports.sh" --quiet || warning "Port calculation failed, using existing ports"
    fi
fi

# Run validation script unless skipped
if [ "$SKIP_VALIDATION" = false ]; then
    if [ -f "$PROJECT_ROOT/scripts/validate-instance.sh" ]; then
        info "Running pre-start validation..."
        bash "$PROJECT_ROOT/scripts/validate-instance.sh" || error "Validation failed. Use --no-validate to skip."
        success "Pre-start validation passed"
    fi
fi

# Determine which compose file to use
COMPOSE_FILE="docker-compose.yml"
if [ "$USE_PROD" = true ]; then
    COMPOSE_FILE="docker-compose.yml -f docker-compose.prod.yml"
    info "Using production configuration"
else
    COMPOSE_FILE="docker-compose.yml -f docker-compose.local.yml"
    info "Using local development configuration"
fi

# Build images if requested
if [ "$BUILD_IMAGES" = true ]; then
    info "Building Docker images..."
    docker-compose -f $COMPOSE_FILE build || error "Failed to build images"
    success "Images built successfully"
fi

# Pull latest images
info "Pulling latest Docker images..."
docker-compose -f $COMPOSE_FILE pull || warning "Failed to pull some images, continuing..."

# Start services
info "Starting Supabase services..."
echo ""
docker-compose -f $COMPOSE_FILE up -d || error "Failed to start services"
echo ""
success "Services started successfully"

# Wait for services to be healthy
info "Waiting for services to become healthy..."
echo ""

# Function to check service health
check_service_health() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose -f $COMPOSE_FILE ps | grep "${PROJECT_NAME}_${service}" | grep -q "healthy\|Up"; then
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    return 1
}

# Check critical services
CRITICAL_SERVICES=("db" "redis" "minio" "meta" "gotrue" "postgrest" "realtime" "storage" "functions" "kong" "studio")

for service in "${CRITICAL_SERVICES[@]}"; do
    echo -n "  Checking ${service}... "
    if check_service_health "$service"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (timeout)${NC}"
        warning "$service did not become healthy in time, but may still be starting"
    fi
done

echo ""
success "All services are starting up"

# Display access URLs
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Supabase is now running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Access URLs:"
echo "  Studio:        http://localhost:${STUDIO_PORT:-3000}"
echo "  API Gateway:   http://localhost:${KONG_HTTP_PORT:-8000}"
echo "  Database:      postgresql://postgres:***@localhost:${POSTGRES_PORT:-5432}/postgres"
echo "  MinIO Console: http://localhost:${MINIO_CONSOLE_PORT:-9001}"
echo ""
echo "API Endpoints:"
echo "  REST API:      http://localhost:${KONG_HTTP_PORT:-8000}/rest/v1"
echo "  Auth:          http://localhost:${KONG_HTTP_PORT:-8000}/auth/v1"
echo "  Storage:       http://localhost:${KONG_HTTP_PORT:-8000}/storage/v1"
echo "  Realtime:      ws://localhost:${KONG_HTTP_PORT:-8000}/realtime/v1"
echo ""
echo "Credentials:"
echo "  Anon Key:      ${ANON_KEY:0:20}..."
echo "  Service Key:   ${SERVICE_ROLE_KEY:0:20}..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "To view logs: docker-compose logs -f [service-name]"
info "To stop services: ./stop.sh"
info "To check health: ../scripts/health-check.sh"
echo ""

# Testing:
# 1. Run ./start.sh in docker directory
# 2. Verify all services start successfully
# 3. Check that URLs are displayed correctly
# 4. Test with --prod flag
# 5. Test with --build flag
# Expected: All services start, health checks pass, access URLs displayed
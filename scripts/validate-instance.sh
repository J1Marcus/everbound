#!/bin/bash
# Script: validate-instance.sh
# Description: Validate instance configuration before starting services
# Usage: ./validate-instance.sh [options]
#
# Options:
#   --fix                  Attempt to fix common issues automatically
#   --skip-ports          Skip port conflict checks
#   --help                Show this help message

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

# Validation results
ERRORS=0
WARNINGS=0

# Functions
function error() {
    echo -e "${RED}✗ ERROR: $1${NC}" >&2
    ERRORS=$((ERRORS + 1))
}

function success() {
    echo -e "${GREEN}✓ $1${NC}"
}

function info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

function warning() {
    echo -e "${YELLOW}⚠ WARNING: $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

function show_help() {
    echo "Usage: ./validate-instance.sh [options]"
    echo ""
    echo "Description:"
    echo "  Validates instance configuration before starting services."
    echo "  Checks for conflicts, missing requirements, and configuration issues."
    echo ""
    echo "Validation Checks:"
    echo "  - Docker and Docker Compose installation"
    echo "  - .env file existence and configuration"
    echo "  - Required environment variables"
    echo "  - Container name conflicts"
    echo "  - Port conflicts"
    echo "  - Disk space availability"
    echo "  - Network connectivity"
    echo ""
    echo "Options:"
    echo "  --fix                  Attempt to fix common issues automatically"
    echo "  --skip-ports          Skip port conflict checks"
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./validate-instance.sh              # Run all validations"
    echo "  ./validate-instance.sh --fix        # Fix issues automatically"
    echo "  ./validate-instance.sh --skip-ports # Skip port checks"
    exit 0
}

# Parse arguments
FIX_MODE=false
SKIP_PORTS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --skip-ports)
            SKIP_PORTS=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            error "Unknown option: $1. Use --help for usage information."
            exit 1
            ;;
    esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase Instance Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check 1: Docker installation
info "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    success "Docker installed: $DOCKER_VERSION"
else
    error "Docker is not installed. Please install Docker first."
    echo "  Visit: https://docs.docker.com/get-docker/"
fi

# Check 2: Docker Compose installation
info "Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f4 | tr -d ',')
    success "Docker Compose installed: $COMPOSE_VERSION"
elif docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    success "Docker Compose (plugin) installed: $COMPOSE_VERSION"
else
    error "Docker Compose is not installed. Please install Docker Compose."
    echo "  Visit: https://docs.docker.com/compose/install/"
fi

# Check 3: Docker daemon running
info "Checking Docker daemon..."
if docker info &> /dev/null; then
    success "Docker daemon is running"
else
    error "Docker daemon is not running. Please start Docker."
fi

# Check 4: .env file existence
info "Checking .env file..."
if [ -f "$ENV_FILE" ]; then
    success ".env file exists"
    
    # Load environment variables
    set -a
    source "$ENV_FILE"
    set +a
else
    error ".env file not found at $ENV_FILE"
    echo "  Run: cp docker/.env.example docker/.env"
    echo "  Then: ./scripts/generate-secrets.sh"
    exit 1
fi

# Check 5: Required environment variables
info "Checking required environment variables..."

REQUIRED_VARS=(
    "PROJECT_NAME:Project name for container isolation"
    "POSTGRES_PASSWORD:PostgreSQL database password"
    "JWT_SECRET:JWT signing secret"
    "ANON_KEY:Anonymous access JWT token"
    "SERVICE_ROLE_KEY:Service role JWT token"
    "MINIO_ROOT_PASSWORD:MinIO storage password"
)

for var_desc in "${REQUIRED_VARS[@]}"; do
    var_name="${var_desc%%:*}"
    var_description="${var_desc#*:}"
    
    if [ -z "${!var_name}" ]; then
        error "$var_name is not set ($var_description)"
    elif [ "${!var_name}" = "<strong-random-password>" ] || \
         [ "${!var_name}" = "<256-bit-secret>" ] || \
         [ "${!var_name}" = "<jwt-token-with-anon-role>" ] || \
         [ "${!var_name}" = "<jwt-token-with-service-role>" ]; then
        error "$var_name contains placeholder value"
        echo "  Run: ./scripts/generate-secrets.sh"
    else
        success "$var_name is set"
    fi
done

# Check 6: PROJECT_NAME validity
info "Checking PROJECT_NAME..."
if [[ "$PROJECT_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
    success "PROJECT_NAME is valid: $PROJECT_NAME"
else
    error "PROJECT_NAME contains invalid characters: $PROJECT_NAME"
    echo "  Use only letters, numbers, hyphens, and underscores"
fi

# Check 7: Container name conflicts
info "Checking for container name conflicts..."
CONFLICTING_CONTAINERS=$(docker ps -a --format '{{.Names}}' | grep "^${PROJECT_NAME}_" || true)

if [ -n "$CONFLICTING_CONTAINERS" ]; then
    warning "Containers with prefix '${PROJECT_NAME}_' already exist:"
    echo "$CONFLICTING_CONTAINERS" | while read container; do
        STATUS=$(docker ps -a --filter "name=$container" --format "{{.Status}}")
        echo "  - $container ($STATUS)"
    done
    echo ""
    echo "  This may indicate:"
    echo "  - Services are already running (use docker/stop.sh to stop)"
    echo "  - Previous containers weren't cleaned up"
    echo "  - Another instance is using the same PROJECT_NAME"
    echo ""
    
    if [ "$FIX_MODE" = true ]; then
        info "Fix mode: Attempting to stop conflicting containers..."
        echo "$CONFLICTING_CONTAINERS" | while read container; do
            docker stop "$container" 2>/dev/null || true
        done
        success "Stopped conflicting containers"
    fi
else
    success "No container name conflicts"
fi

# Check 8: Port conflicts
if [ "$SKIP_PORTS" = false ]; then
    info "Checking for port conflicts..."
    
    PORTS_TO_CHECK=(
        "${POSTGRES_PORT:-5432}:PostgreSQL"
        "${KONG_HTTP_PORT:-8000}:Kong HTTP"
        "${KONG_HTTPS_PORT:-8443}:Kong HTTPS"
        "${STUDIO_PORT:-3000}:Studio"
        "${MINIO_PORT:-9000}:MinIO API"
        "${MINIO_CONSOLE_PORT:-9001}:MinIO Console"
        "${REDIS_PORT:-6379}:Redis"
    )
    
    PORT_CONFLICTS=false
    for port_desc in "${PORTS_TO_CHECK[@]}"; do
        port="${port_desc%%:*}"
        service="${port_desc#*:}"
        
        # Check if port is in use (works on macOS and Linux)
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 || \
           netstat -an 2>/dev/null | grep -q ":$port.*LISTEN" 2>/dev/null; then
            error "Port $port is already in use ($service)"
            
            # Try to identify the process
            if command -v lsof &> /dev/null; then
                PROCESS=$(lsof -Pi :$port -sTCP:LISTEN 2>/dev/null | tail -n 1 || echo "Unknown")
                echo "  Process: $PROCESS"
            fi
            
            PORT_CONFLICTS=true
        fi
    done
    
    if [ "$PORT_CONFLICTS" = false ]; then
        success "No port conflicts detected"
    else
        echo ""
        echo "  To resolve port conflicts:"
        echo "  1. Stop the conflicting services"
        echo "  2. Change PORT_OFFSET in .env (e.g., PORT_OFFSET=100)"
        echo "  3. Run: ./scripts/calculate-ports.sh"
        echo ""
    fi
else
    info "Skipping port conflict checks (--skip-ports)"
fi

# Check 9: Disk space
info "Checking disk space..."
AVAILABLE_SPACE=$(df -h "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
AVAILABLE_SPACE_GB=$(df -BG "$PROJECT_ROOT" | awk 'NR==2 {print $4}' | tr -d 'G')

if [ "$AVAILABLE_SPACE_GB" -lt 10 ]; then
    warning "Low disk space: ${AVAILABLE_SPACE} available"
    echo "  Recommended: At least 10GB free space"
    echo "  Current: ${AVAILABLE_SPACE}"
else
    success "Sufficient disk space: ${AVAILABLE_SPACE} available"
fi

# Check 10: Network connectivity
info "Checking network connectivity..."
if ping -c 1 8.8.8.8 &> /dev/null; then
    success "Network connectivity OK"
else
    warning "Network connectivity issue detected"
    echo "  Some features may not work without internet access"
fi

# Check 11: Docker network conflicts
info "Checking for Docker network conflicts..."
CONFLICTING_NETWORKS=$(docker network ls --filter "name=${PROJECT_NAME}_" --format "{{.Name}}" || true)

if [ -n "$CONFLICTING_NETWORKS" ]; then
    warning "Networks with prefix '${PROJECT_NAME}_' already exist:"
    echo "$CONFLICTING_NETWORKS" | while read network; do
        echo "  - $network"
    done
    echo "  This is normal if services were previously running"
else
    success "No network conflicts"
fi

# Check 12: Volume conflicts
info "Checking for existing volumes..."
EXISTING_VOLUMES=$(docker volume ls -q | grep "^${PROJECT_NAME}_" || true)

if [ -n "$EXISTING_VOLUMES" ]; then
    info "Existing volumes found (data will be preserved):"
    echo "$EXISTING_VOLUMES" | while read volume; do
        SIZE=$(docker volume inspect "$volume" --format '{{.Mountpoint}}' 2>/dev/null | xargs du -sh 2>/dev/null | cut -f1 || echo "unknown")
        echo "  - $volume ($SIZE)"
    done
else
    info "No existing volumes (fresh installation)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All validations passed!${NC}"
    echo ""
    echo "  Your instance is ready to start."
    echo "  Run: cd docker && ./start.sh"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Validation completed with $WARNINGS warning(s)${NC}"
    echo ""
    echo "  You can proceed, but review the warnings above."
    echo "  Run: cd docker && ./start.sh"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo ""
    echo "  Please fix the errors above before starting services."
    echo ""
    
    if [ "$FIX_MODE" = false ]; then
        echo "  Try running with --fix to automatically fix common issues:"
        echo "  ./scripts/validate-instance.sh --fix"
        echo ""
    fi
    
    exit 1
fi

# Testing:
# 1. Run ./validate-instance.sh with missing .env
# 2. Run with placeholder values in .env
# 3. Run with services already running
# 4. Run with port conflicts
# 5. Test --fix mode
# 6. Test --skip-ports flag
# Expected: All checks run, appropriate errors/warnings displayed
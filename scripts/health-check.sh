#!/bin/bash
# Script: health-check.sh
# Description: Verify all Supabase services are running correctly
# Usage: ./health-check.sh [options]
#
# Options:
#   --json                 Output results in JSON format
#   --service <name>       Check specific service only
#   --wait                 Wait for services to become healthy
#   --timeout <seconds>    Timeout for wait mode (default: 300)
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

# Health check results
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Functions
function error() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${RED}✗ $1${NC}"
    fi
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
}

function success() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${GREEN}✓ $1${NC}"
    fi
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
}

function info() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${BLUE}ℹ $1${NC}"
    fi
}

function warning() {
    if [ "$JSON_OUTPUT" = false ]; then
        echo -e "${YELLOW}⚠ $1${NC}"
    fi
}

function show_help() {
    echo "Usage: ./health-check.sh [options]"
    echo ""
    echo "Description:"
    echo "  Verifies all Supabase services are running correctly."
    echo "  Checks container status, health endpoints, and connectivity."
    echo ""
    echo "Options:"
    echo "  --json                 Output results in JSON format"
    echo "  --service <name>       Check specific service only"
    echo "  --wait                 Wait for services to become healthy"
    echo "  --timeout <seconds>    Timeout for wait mode (default: 300)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./health-check.sh                    # Check all services"
    echo "  ./health-check.sh --json             # JSON output"
    echo "  ./health-check.sh --service db       # Check database only"
    echo "  ./health-check.sh --wait             # Wait for healthy status"
    exit 0
}

# Parse arguments
JSON_OUTPUT=false
SPECIFIC_SERVICE=""
WAIT_MODE=false
TIMEOUT=300

while [[ $# -gt 0 ]]; do
    case $1 in
        --json)
            JSON_OUTPUT=true
            shift
            ;;
        --service)
            SPECIFIC_SERVICE="$2"
            shift 2
            ;;
        --wait)
            WAIT_MODE=true
            shift
            ;;
        --timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --help)
            show_help
            ;;
        *)
            echo "Unknown option: $1. Use --help for usage information."
            exit 1
            ;;
    esac
done

# Load environment
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    if [ "$JSON_OUTPUT" = false ]; then
        echo "ERROR: .env file not found at $ENV_FILE"
    fi
    exit 1
fi

# JSON output initialization
if [ "$JSON_OUTPUT" = true ]; then
    echo "{"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"project_name\": \"${PROJECT_NAME}\","
    echo "  \"checks\": ["
fi

# Header
if [ "$JSON_OUTPUT" = false ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Supabase Health Check - ${PROJECT_NAME}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Function to check container status
check_container() {
    local service=$1
    local container_name="${PROJECT_NAME}_${service}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$JSON_OUTPUT" = true ]; then
        [ $TOTAL_CHECKS -gt 1 ] && echo ","
        echo -n "    {\"service\": \"$service\", \"type\": \"container\", "
    else
        echo -n "  Checking ${service} container... "
    fi
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null || echo "unknown")
        
        if [ "$status" = "running" ]; then
            if [ "$JSON_OUTPUT" = true ]; then
                echo "\"status\": \"healthy\", \"message\": \"Container running\"}"
            else
                success "Running"
            fi
        else
            if [ "$JSON_OUTPUT" = true ]; then
                echo "\"status\": \"unhealthy\", \"message\": \"Container status: $status\"}"
            else
                error "Status: $status"
            fi
        fi
    else
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"unhealthy\", \"message\": \"Container not found\"}"
        else
            error "Not found"
        fi
    fi
}

# Function to check health endpoint
check_health_endpoint() {
    local service=$1
    local url=$2
    local container_name="${PROJECT_NAME}_${service}"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ","
        echo -n "    {\"service\": \"$service\", \"type\": \"health_endpoint\", "
    else
        echo -n "  Checking ${service} health endpoint... "
    fi
    
    # Check if container is running first
    if ! docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"unhealthy\", \"message\": \"Container not running\"}"
        else
            error "Container not running"
        fi
        return
    fi
    
    # Try to curl the health endpoint
    if docker exec "$container_name" wget --spider --timeout=5 --tries=1 "$url" &>/dev/null 2>&1 || \
       curl -sf --max-time 5 "$url" &>/dev/null 2>&1; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"healthy\", \"message\": \"Health endpoint responding\"}"
        else
            success "Healthy"
        fi
    else
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"unhealthy\", \"message\": \"Health endpoint not responding\"}"
        else
            error "Not responding"
        fi
    fi
}

# Function to check database connectivity
check_database() {
    local container_name="${PROJECT_NAME}_db"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ","
        echo -n "    {\"service\": \"db\", \"type\": \"connectivity\", "
    else
        echo -n "  Checking database connectivity... "
    fi
    
    if docker exec "$container_name" pg_isready -U postgres &>/dev/null; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"healthy\", \"message\": \"Database accepting connections\"}"
        else
            success "Accepting connections"
        fi
    else
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"unhealthy\", \"message\": \"Database not accepting connections\"}"
        else
            error "Not accepting connections"
        fi
    fi
}

# Function to check Redis
check_redis() {
    local container_name="${PROJECT_NAME}_redis"
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ","
        echo -n "    {\"service\": \"redis\", \"type\": \"connectivity\", "
    else
        echo -n "  Checking Redis connectivity... "
    fi
    
    if docker exec "$container_name" redis-cli ping &>/dev/null | grep -q "PONG"; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"healthy\", \"message\": \"Redis responding\"}"
        else
            success "Responding"
        fi
    else
        if [ "$JSON_OUTPUT" = true ]; then
            echo "\"status\": \"unhealthy\", \"message\": \"Redis not responding\"}"
        else
            error "Not responding"
        fi
    fi
}

# Run health checks
if [ "$JSON_OUTPUT" = false ]; then
    info "Running health checks..."
    echo ""
fi

# Check all services or specific service
if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "db" ]; then
    check_container "db"
    check_database
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "redis" ]; then
    check_container "redis"
    check_redis
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "minio" ]; then
    check_container "minio"
    check_health_endpoint "minio" "http://localhost:9000/minio/health/live"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "meta" ]; then
    check_container "meta"
    check_health_endpoint "meta" "http://localhost:8080/health"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "gotrue" ]; then
    check_container "gotrue"
    check_health_endpoint "gotrue" "http://localhost:9999/health"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "postgrest" ]; then
    check_container "postgrest"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "realtime" ]; then
    check_container "realtime"
    check_health_endpoint "realtime" "http://localhost:4000/api/health"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "storage" ]; then
    check_container "storage"
    check_health_endpoint "storage" "http://localhost:5000/status"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "functions" ]; then
    check_container "functions"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "kong" ]; then
    check_container "kong"
fi

if [ -z "$SPECIFIC_SERVICE" ] || [ "$SPECIFIC_SERVICE" = "studio" ]; then
    check_container "studio"
    check_health_endpoint "studio" "http://localhost:3000/api/profile"
fi

# JSON output closing
if [ "$JSON_OUTPUT" = true ]; then
    echo ""
    echo "  ],"
    echo "  \"summary\": {"
    echo "    \"total\": $TOTAL_CHECKS,"
    echo "    \"passed\": $PASSED_CHECKS,"
    echo "    \"failed\": $FAILED_CHECKS,"
    echo "    \"status\": \"$([ $FAILED_CHECKS -eq 0 ] && echo 'healthy' || echo 'unhealthy')\""
    echo "  }"
    echo "}"
else
    # Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Health Check Summary"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  Total checks: $TOTAL_CHECKS"
    echo "  Passed: ${GREEN}$PASSED_CHECKS${NC}"
    echo "  Failed: ${RED}$FAILED_CHECKS${NC}"
    echo ""
    
    if [ $FAILED_CHECKS -eq 0 ]; then
        echo -e "${GREEN}✓ All services are healthy!${NC}"
        echo ""
    else
        echo -e "${RED}✗ Some services are unhealthy${NC}"
        echo ""
        echo "  Troubleshooting:"
        echo "  - Check logs: docker-compose logs -f [service-name]"
        echo "  - Restart services: cd docker && ./stop.sh && ./start.sh"
        echo "  - See docs/TROUBLESHOOTING.md for more help"
        echo ""
    fi
fi

# Exit with appropriate code
if [ $FAILED_CHECKS -eq 0 ]; then
    exit 0
else
    exit 1
fi

# Testing:
# 1. Start services with ./start.sh
# 2. Run ./health-check.sh
# 3. Verify all services show as healthy
# 4. Test --json flag for JSON output
# 5. Test --service flag for specific service
# 6. Stop a service and verify it shows as unhealthy
# Expected: All checks run, appropriate status displayed, correct exit code
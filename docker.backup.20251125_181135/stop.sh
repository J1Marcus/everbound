#!/bin/bash
# Script: stop.sh
# Description: Stop all Supabase services gracefully
# Usage: ./stop.sh [options]
#
# Options:
#   --remove, -r           Remove containers after stopping
#   --volumes, -v          Remove volumes (DESTRUCTIVE - requires confirmation)
#   --clean                Remove containers, networks, and orphans
#   --force, -f            Force removal without confirmation
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
    echo "Usage: ./stop.sh [options]"
    echo ""
    echo "Options:"
    echo "  --remove, -r           Remove containers after stopping"
    echo "  --volumes, -v          Remove volumes (DESTRUCTIVE - requires confirmation)"
    echo "  --clean                Remove containers, networks, and orphans"
    echo "  --force, -f            Force removal without confirmation"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./stop.sh                    # Stop services, keep containers"
    echo "  ./stop.sh --remove           # Stop and remove containers"
    echo "  ./stop.sh --volumes          # Stop and remove everything (with confirmation)"
    echo "  ./stop.sh --clean            # Clean up containers and networks"
    exit 0
}

# Parse arguments
REMOVE_CONTAINERS=false
REMOVE_VOLUMES=false
CLEAN_MODE=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --remove|-r)
            REMOVE_CONTAINERS=true
            shift
            ;;
        --volumes|-v)
            REMOVE_VOLUMES=true
            REMOVE_CONTAINERS=true
            shift
            ;;
        --clean)
            CLEAN_MODE=true
            REMOVE_CONTAINERS=true
            shift
            ;;
        --force|-f)
            FORCE=true
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
    warning ".env file not found, using default PROJECT_NAME"
    PROJECT_NAME="supabase_template"
else
    # Load environment variables
    set -a
    source .env
    set +a
fi

# Confirm destructive operations
if [ "$REMOVE_VOLUMES" = true ] && [ "$FORCE" = false ]; then
    echo ""
    warning "⚠️  WARNING: This will DELETE ALL DATA including:"
    echo "  - PostgreSQL database"
    echo "  - MinIO storage files"
    echo "  - Redis cache"
    echo "  - All configuration"
    echo ""
    echo -e "${RED}THIS OPERATION CANNOT BE UNDONE!${NC}"
    echo ""
    read -p "Are you sure you want to continue? Type 'yes' to confirm: " -r
    echo ""
    if [[ ! $REPLY =~ ^yes$ ]]; then
        info "Operation cancelled"
        exit 0
    fi
fi

# Determine compose files
COMPOSE_FILES="-f docker-compose.yml"
if [ -f docker-compose.local.yml ]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.local.yml"
fi
if [ -f docker-compose.prod.yml ]; then
    COMPOSE_FILES="$COMPOSE_FILES -f docker-compose.prod.yml"
fi

# Stop services
info "Stopping Supabase services..."
echo ""

if docker-compose $COMPOSE_FILES ps -q 2>/dev/null | grep -q .; then
    docker-compose $COMPOSE_FILES stop || warning "Some services may have already been stopped"
    success "Services stopped"
else
    info "No running services found"
fi

# Remove containers if requested
if [ "$REMOVE_CONTAINERS" = true ]; then
    info "Removing containers..."
    
    if [ "$CLEAN_MODE" = true ]; then
        docker-compose $COMPOSE_FILES down --remove-orphans || warning "Failed to remove some containers"
    else
        docker-compose $COMPOSE_FILES down || warning "Failed to remove some containers"
    fi
    
    success "Containers removed"
fi

# Remove volumes if requested
if [ "$REMOVE_VOLUMES" = true ]; then
    info "Removing volumes..."
    
    # List volumes to be removed
    VOLUMES=$(docker volume ls -q | grep "^${PROJECT_NAME}_" || true)
    
    if [ -n "$VOLUMES" ]; then
        echo "  Removing volumes:"
        echo "$VOLUMES" | while read volume; do
            echo "    - $volume"
        done
        
        docker-compose $COMPOSE_FILES down -v || warning "Failed to remove some volumes"
        
        # Remove any remaining volumes with project name
        echo "$VOLUMES" | while read volume; do
            docker volume rm "$volume" 2>/dev/null || true
        done
        
        success "Volumes removed"
    else
        info "No volumes found to remove"
    fi
fi

# Display status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Supabase services stopped${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show remaining resources
REMAINING_CONTAINERS=$(docker ps -a --filter "name=${PROJECT_NAME}_" --format "{{.Names}}" 2>/dev/null || true)
REMAINING_VOLUMES=$(docker volume ls -q | grep "^${PROJECT_NAME}_" 2>/dev/null || true)
REMAINING_NETWORKS=$(docker network ls --filter "name=${PROJECT_NAME}_" --format "{{.Name}}" 2>/dev/null || true)

if [ -n "$REMAINING_CONTAINERS" ]; then
    info "Remaining containers:"
    echo "$REMAINING_CONTAINERS" | while read container; do
        echo "  - $container"
    done
    echo ""
fi

if [ -n "$REMAINING_VOLUMES" ]; then
    info "Remaining volumes (data preserved):"
    echo "$REMAINING_VOLUMES" | while read volume; do
        SIZE=$(docker volume inspect "$volume" --format '{{.Mountpoint}}' 2>/dev/null | xargs du -sh 2>/dev/null | cut -f1 || echo "unknown")
        echo "  - $volume ($SIZE)"
    done
    echo ""
    warning "To remove volumes and delete all data, run: ./stop.sh --volumes"
fi

if [ -n "$REMAINING_NETWORKS" ]; then
    info "Remaining networks:"
    echo "$REMAINING_NETWORKS" | while read network; do
        echo "  - $network"
    done
    echo ""
fi

if [ -z "$REMAINING_CONTAINERS" ] && [ -z "$REMAINING_VOLUMES" ] && [ -z "$REMAINING_NETWORKS" ]; then
    success "All resources cleaned up"
fi

echo ""
info "To start services again: ./start.sh"
echo ""

# Testing:
# 1. Start services with ./start.sh
# 2. Run ./stop.sh (should stop but keep containers)
# 3. Run ./stop.sh --remove (should remove containers)
# 4. Run ./stop.sh --volumes (should prompt for confirmation)
# 5. Test with --force flag to skip confirmation
# Expected: Services stop gracefully, appropriate cleanup based on flags
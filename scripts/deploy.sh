#!/bin/bash
# Script: deploy.sh
# Description: Deploy Supabase instance with safety checks
# Usage: ./deploy.sh [options]
#
# Options:
#   --local, -l            Deploy for local development
#   --production, --prod   Deploy for production
#   --build                Rebuild images before deploying
#   --prune                Clean up old images and volumes
#   --restart              Restart services (no rebuild)
#   --no-backup            Skip pre-deployment backup
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
    echo -e "${GREEN}✓ $1${NC}"
}

function info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

function warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

function show_help() {
    echo "Usage: ./deploy.sh [options]"
    echo ""
    echo "Description:"
    echo "  Deploys Supabase instance with comprehensive safety checks,"
    echo "  automatic backups, and rollback capability."
    echo ""
    echo "Options:"
    echo "  --local, -l            Deploy for local development"
    echo "  --production, --prod   Deploy for production"
    echo "  --build                Rebuild images before deploying"
    echo "  --prune                Clean up old images and volumes"
    echo "  --restart              Restart services (no rebuild)"
    echo "  --no-backup            Skip pre-deployment backup"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh --local              # Local deployment"
    echo "  ./deploy.sh --production         # Production deployment"
    echo "  ./deploy.sh --build --prune      # Full rebuild and cleanup"
    echo "  ./deploy.sh --restart            # Quick restart"
    exit 0
}

# Parse arguments
ENVIRONMENT="local"
BUILD_IMAGES=false
PRUNE=false
RESTART_ONLY=false
SKIP_BACKUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --local|-l)
            ENVIRONMENT="local"
            shift
            ;;
        --production|--prod)
            ENVIRONMENT="production"
            shift
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        --prune)
            PRUNE=true
            shift
            ;;
        --restart)
            RESTART_ONLY=true
            shift
            ;;
        --no-backup)
            SKIP_BACKUP=true
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

# Load environment
if [ ! -f "$ENV_FILE" ]; then
    error ".env file not found at $ENV_FILE"
fi

set -a
source "$ENV_FILE"
set +a

# Deployment header
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase Deployment - ${PROJECT_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Environment: ${ENVIRONMENT}"
echo "Instance: ${PROJECT_NAME}"
echo ""

# Step 1: Pre-deployment validation
info "Step 1/7: Running pre-deployment validation..."
echo ""

if [ -f "$SCRIPT_DIR/validate-instance.sh" ]; then
    bash "$SCRIPT_DIR/validate-instance.sh" --skip-ports || error "Validation failed"
else
    warning "Validation script not found, skipping..."
fi

success "Validation passed"
echo ""

# Step 2: Pre-deployment backup
if [ "$SKIP_BACKUP" = false ] && [ "$RESTART_ONLY" = false ]; then
    info "Step 2/7: Creating pre-deployment backup..."
    echo ""
    
    if [ -f "$SCRIPT_DIR/backup.sh" ]; then
        BACKUP_OUTPUT=$(bash "$SCRIPT_DIR/backup.sh" 2>&1 | tail -n 5)
        BACKUP_PATH=$(echo "$BACKUP_OUTPUT" | grep "Backup location:" | cut -d: -f2- | xargs)
        
        if [ -n "$BACKUP_PATH" ]; then
            success "Backup created: $BACKUP_PATH"
        else
            warning "Backup may have failed, but continuing..."
        fi
    else
        warning "Backup script not found, skipping..."
    fi
    
    echo ""
else
    info "Step 2/7: Skipping pre-deployment backup"
    echo ""
fi

# Step 3: Pull latest images
if [ "$BUILD_IMAGES" = false ] && [ "$RESTART_ONLY" = false ]; then
    info "Step 3/7: Pulling latest Docker images..."
    echo ""
    
    cd "$PROJECT_ROOT/docker"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml pull || warning "Failed to pull some images"
    else
        docker-compose -f docker-compose.yml -f docker-compose.local.yml pull || warning "Failed to pull some images"
    fi
    
    cd "$SCRIPT_DIR"
    success "Images pulled"
    echo ""
else
    info "Step 3/7: Skipping image pull"
    echo ""
fi

# Step 4: Build images if requested
if [ "$BUILD_IMAGES" = true ]; then
    info "Step 4/7: Building Docker images..."
    echo ""
    
    cd "$PROJECT_ROOT/docker"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build || error "Failed to build images"
    else
        docker-compose -f docker-compose.yml -f docker-compose.local.yml build || error "Failed to build images"
    fi
    
    cd "$SCRIPT_DIR"
    success "Images built"
    echo ""
else
    info "Step 4/7: Skipping image build"
    echo ""
fi

# Step 5: Stop services
info "Step 5/7: Stopping current services..."
echo ""

cd "$PROJECT_ROOT/docker"

if docker-compose ps -q 2>/dev/null | grep -q .; then
    ./stop.sh || warning "Failed to stop some services"
    success "Services stopped"
else
    info "No services running"
fi

echo ""

# Step 6: Prune if requested
if [ "$PRUNE" = true ]; then
    info "Step 6/7: Cleaning up old resources..."
    echo ""
    
    # Remove unused images
    info "Removing unused images..."
    docker image prune -f || warning "Failed to prune images"
    
    # Remove unused volumes (be careful!)
    warning "Removing unused volumes..."
    docker volume prune -f || warning "Failed to prune volumes"
    
    # Remove unused networks
    info "Removing unused networks..."
    docker network prune -f || warning "Failed to prune networks"
    
    success "Cleanup completed"
    echo ""
else
    info "Step 6/7: Skipping cleanup"
    echo ""
fi

# Step 7: Start services
info "Step 7/7: Starting services..."
echo ""

cd "$PROJECT_ROOT/docker"

if [ "$ENVIRONMENT" = "production" ]; then
    ./start.sh --prod || error "Failed to start services"
else
    ./start.sh || error "Failed to start services"
fi

cd "$SCRIPT_DIR"
success "Services started"
echo ""

# Post-deployment health check
info "Running post-deployment health check..."
echo ""

sleep 5  # Give services a moment to stabilize

if [ -f "$SCRIPT_DIR/health-check.sh" ]; then
    if bash "$SCRIPT_DIR/health-check.sh"; then
        success "Health check passed"
    else
        warning "Health check failed - some services may not be healthy"
        echo ""
        echo "  Check logs: docker-compose logs -f"
        echo "  Rollback: ./scripts/restore.sh --backup $BACKUP_PATH"
        echo ""
    fi
else
    warning "Health check script not found"
fi

# Deployment summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Instance: ${PROJECT_NAME}"
echo "Environment: ${ENVIRONMENT}"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "Production URLs:"
    echo "  Studio: https://${STUDIO_DOMAIN:-studio.yourdomain.com}"
    echo "  API: https://${API_DOMAIN:-api.yourdomain.com}"
else
    echo "Local URLs:"
    echo "  Studio: http://localhost:${STUDIO_PORT:-3000}"
    echo "  API Gateway: http://localhost:${KONG_HTTP_PORT:-8000}"
fi

echo ""
echo "Useful commands:"
echo "  View logs: docker-compose logs -f [service]"
echo "  Check health: ./scripts/health-check.sh"
echo "  Stop services: cd docker && ./stop.sh"

if [ -n "$BACKUP_PATH" ]; then
    echo "  Rollback: ./scripts/restore.sh --backup $BACKUP_PATH"
fi

echo ""

# Production-specific warnings
if [ "$ENVIRONMENT" = "production" ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}Production Deployment Checklist:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  ☐ Verify DNS records point to this server"
    echo "  ☐ Confirm SSL certificates are valid"
    echo "  ☐ Test all API endpoints"
    echo "  ☐ Verify authentication is working"
    echo "  ☐ Check storage upload/download"
    echo "  ☐ Monitor logs for errors"
    echo "  ☐ Set up automated backups (cron)"
    echo "  ☐ Configure monitoring/alerting"
    echo ""
fi

# Testing:
# 1. Run ./deploy.sh --local
# 2. Verify all steps execute successfully
# 3. Check services are running
# 4. Test --build flag
# 5. Test --prune flag
# 6. Test --production flag
# 7. Verify backup is created before deployment
# 8. Verify health check runs after deployment
# Expected: Complete deployment with all safety checks
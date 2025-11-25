#!/bin/bash
# Script: switch-instance.sh
# Description: Switch between different Supabase instances
# Usage: ./switch-instance.sh [instance-name] [options]
#
# Options:
#   --list                 List available instances
#   --start                Start the instance after switching
#   --stop-current         Stop current instance before switching
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
    echo "Usage: ./switch-instance.sh [instance-name] [options]"
    echo ""
    echo "Description:"
    echo "  Switches between different Supabase instances by updating"
    echo "  the PROJECT_NAME in the .env file."
    echo ""
    echo "Options:"
    echo "  --list                 List available instances"
    echo "  --start                Start the instance after switching"
    echo "  --stop-current         Stop current instance before switching"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./switch-instance.sh                      # Interactive mode"
    echo "  ./switch-instance.sh customer_a           # Switch to customer_a"
    echo "  ./switch-instance.sh customer_b --start   # Switch and start"
    echo "  ./switch-instance.sh --list               # List instances"
    exit 0
}

# List available instances
list_instances() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Available Supabase Instances"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Find all instances
    INSTANCES=$(docker ps -a --format '{{.Names}}' | grep '_db$' | sed 's/_db$//' | sort -u || true)
    
    if [ -z "$INSTANCES" ]; then
        echo "No instances found."
        echo ""
        exit 0
    fi
    
    # Get current instance
    CURRENT_INSTANCE=""
    if [ -f "$ENV_FILE" ]; then
        CURRENT_INSTANCE=$(grep "^PROJECT_NAME=" "$ENV_FILE" | cut -d= -f2 | tr -d '"' || echo "")
    fi
    
    # List instances
    INDEX=1
    for instance in $INSTANCES; do
        STATUS=$(docker ps --filter "name=^${instance}_db$" --format "{{.Status}}" 2>/dev/null || echo "Stopped")
        
        if echo "$STATUS" | grep -q "Up"; then
            STATUS_ICON="${GREEN}●${NC}"
            STATUS_TEXT="${GREEN}Running${NC}"
        else
            STATUS_ICON="${RED}●${NC}"
            STATUS_TEXT="${RED}Stopped${NC}"
        fi
        
        CURRENT_MARKER=""
        if [ "$instance" = "$CURRENT_INSTANCE" ]; then
            CURRENT_MARKER=" ${BLUE}(current)${NC}"
        fi
        
        echo -e "  ${INDEX}. ${STATUS_ICON} ${instance}${CURRENT_MARKER} - ${STATUS_TEXT}"
        INDEX=$((INDEX + 1))
    done
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Parse arguments
TARGET_INSTANCE=""
START_AFTER=false
STOP_CURRENT=false
LIST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            LIST_ONLY=true
            shift
            ;;
        --start)
            START_AFTER=true
            shift
            ;;
        --stop-current)
            STOP_CURRENT=true
            shift
            ;;
        --help)
            show_help
            ;;
        -*)
            error "Unknown option: $1. Use --help for usage information."
            ;;
        *)
            TARGET_INSTANCE="$1"
            shift
            ;;
    esac
done

# List instances if requested
if [ "$LIST_ONLY" = true ]; then
    list_instances
    exit 0
fi

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    error ".env file not found at $ENV_FILE"
fi

# Get current instance
CURRENT_INSTANCE=$(grep "^PROJECT_NAME=" "$ENV_FILE" | cut -d= -f2 | tr -d '"' || echo "")

# Interactive mode if no target specified
if [ -z "$TARGET_INSTANCE" ]; then
    list_instances
    
    echo "Enter the instance name or number to switch to (or 'q' to quit):"
    read -p "> " SELECTION
    
    if [ "$SELECTION" = "q" ] || [ "$SELECTION" = "Q" ]; then
        info "Operation cancelled"
        exit 0
    fi
    
    # Check if selection is a number
    if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
        # Get instance by index
        INSTANCES=$(docker ps -a --format '{{.Names}}' | grep '_db$' | sed 's/_db$//' | sort -u)
        TARGET_INSTANCE=$(echo "$INSTANCES" | sed -n "${SELECTION}p")
        
        if [ -z "$TARGET_INSTANCE" ]; then
            error "Invalid selection: $SELECTION"
        fi
    else
        TARGET_INSTANCE="$SELECTION"
    fi
fi

# Validate target instance exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${TARGET_INSTANCE}_db$"; then
    error "Instance '$TARGET_INSTANCE' not found. Use --list to see available instances."
fi

# Check if already on target instance
if [ "$TARGET_INSTANCE" = "$CURRENT_INSTANCE" ]; then
    warning "Already on instance: $TARGET_INSTANCE"
    exit 0
fi

echo ""
info "Switching from '$CURRENT_INSTANCE' to '$TARGET_INSTANCE'..."
echo ""

# Stop current instance if requested
if [ "$STOP_CURRENT" = true ] && [ -n "$CURRENT_INSTANCE" ]; then
    info "Stopping current instance: $CURRENT_INSTANCE"
    
    if docker ps --filter "name=${CURRENT_INSTANCE}_" --format "{{.Names}}" | grep -q .; then
        cd "$PROJECT_ROOT/docker"
        ./stop.sh || warning "Failed to stop current instance"
        cd "$SCRIPT_DIR"
    else
        info "Current instance is not running"
    fi
    
    echo ""
fi

# Backup current .env
BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
success "Backed up .env to $BACKUP_FILE"

# Update PROJECT_NAME in .env
sed -i.tmp "s|^PROJECT_NAME=.*|PROJECT_NAME=${TARGET_INSTANCE}|" "$ENV_FILE"
rm -f "${ENV_FILE}.tmp"

success "Updated PROJECT_NAME to: $TARGET_INSTANCE"

# Display instance info
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Successfully switched to instance: ${TARGET_INSTANCE}${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check instance status
STATUS=$(docker ps --filter "name=^${TARGET_INSTANCE}_db$" --format "{{.Status}}" 2>/dev/null || echo "Stopped")

if echo "$STATUS" | grep -q "Up"; then
    success "Instance is currently running"
    
    # Get ports
    STUDIO_PORT=$(docker port "${TARGET_INSTANCE}_studio" 3000 2>/dev/null | cut -d: -f2 || echo "N/A")
    KONG_PORT=$(docker port "${TARGET_INSTANCE}_kong" 8000 2>/dev/null | cut -d: -f2 || echo "N/A")
    
    echo ""
    echo "Access URLs:"
    echo "  Studio:      http://localhost:${STUDIO_PORT}"
    echo "  API Gateway: http://localhost:${KONG_PORT}"
    echo ""
else
    info "Instance is currently stopped"
    echo ""
    
    if [ "$START_AFTER" = true ]; then
        info "Starting instance..."
        cd "$PROJECT_ROOT/docker"
        ./start.sh || error "Failed to start instance"
    else
        echo "To start this instance:"
        echo "  cd docker && ./start.sh"
        echo ""
    fi
fi

# Display next steps
if [ "$START_AFTER" = false ] && ! echo "$STATUS" | grep -q "Up"; then
    echo "Next steps:"
    echo "  1. Review configuration: cat docker/.env"
    echo "  2. Start services: cd docker && ./start.sh"
    echo "  3. Check health: ./scripts/health-check.sh"
    echo ""
fi

# Testing:
# 1. Create multiple instances with different PROJECT_NAMEs
# 2. Run ./switch-instance.sh --list
# 3. Run ./switch-instance.sh <instance-name>
# 4. Verify .env is updated with new PROJECT_NAME
# 5. Test --start flag to start after switching
# 6. Test --stop-current flag
# Expected: Successfully switches between instances, .env updated
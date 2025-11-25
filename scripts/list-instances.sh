#!/bin/bash
# Script: list-instances.sh
# Description: List all Supabase instances on the system
# Usage: ./list-instances.sh [options]
#
# Options:
#   --running              List only running instances
#   --stopped              List only stopped instances
#   --json                 Output in JSON format
#   --help                 Show this help message

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
function show_help() {
    echo "Usage: ./list-instances.sh [options]"
    echo ""
    echo "Description:"
    echo "  Lists all Supabase instances on the system with their status,"
    echo "  port mappings, and resource usage."
    echo ""
    echo "Options:"
    echo "  --running              List only running instances"
    echo "  --stopped              List only stopped instances"
    echo "  --json                 Output in JSON format"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./list-instances.sh                # List all instances"
    echo "  ./list-instances.sh --running      # List only running"
    echo "  ./list-instances.sh --json         # JSON output"
    exit 0
}

# Parse arguments
FILTER="all"
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --running)
            FILTER="running"
            shift
            ;;
        --stopped)
            FILTER="stopped"
            shift
            ;;
        --json)
            JSON_OUTPUT=true
            shift
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

# Find all Supabase instances by looking for _db containers
INSTANCES=$(docker ps -a --format '{{.Names}}' | grep '_db$' | sed 's/_db$//' | sort -u || true)

if [ -z "$INSTANCES" ]; then
    if [ "$JSON_OUTPUT" = false ]; then
        echo ""
        echo "No Supabase instances found."
        echo ""
        echo "To create an instance:"
        echo "  1. Copy docker/.env.example to docker/.env"
        echo "  2. Set a unique PROJECT_NAME"
        echo "  3. Run: ./scripts/generate-secrets.sh"
        echo "  4. Run: cd docker && ./start.sh"
        echo ""
    else
        echo "{\"instances\": []}"
    fi
    exit 0
fi

# JSON output initialization
if [ "$JSON_OUTPUT" = true ]; then
    echo "{"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"instances\": ["
    FIRST_INSTANCE=true
fi

# Header for table output
if [ "$JSON_OUTPUT" = false ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Supabase Instances"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Process each instance
for instance in $INSTANCES; do
    # Get container status
    DB_CONTAINER="${instance}_db"
    STATUS=$(docker ps -a --filter "name=^${DB_CONTAINER}$" --format "{{.Status}}" 2>/dev/null || echo "unknown")
    
    # Determine if running
    IS_RUNNING=false
    if echo "$STATUS" | grep -q "Up"; then
        IS_RUNNING=true
    fi
    
    # Apply filter
    if [ "$FILTER" = "running" ] && [ "$IS_RUNNING" = false ]; then
        continue
    fi
    if [ "$FILTER" = "stopped" ] && [ "$IS_RUNNING" = true ]; then
        continue
    fi
    
    # Get container count
    CONTAINER_COUNT=$(docker ps -a --filter "name=${instance}_" --format "{{.Names}}" | wc -l | tr -d ' ')
    RUNNING_COUNT=$(docker ps --filter "name=${instance}_" --format "{{.Names}}" | wc -l | tr -d ' ')
    
    # Get port mappings for key services
    STUDIO_PORT=$(docker port "${instance}_studio" 3000 2>/dev/null | cut -d: -f2 || echo "N/A")
    KONG_PORT=$(docker port "${instance}_kong" 8000 2>/dev/null | cut -d: -f2 || echo "N/A")
    DB_PORT=$(docker port "${instance}_db" 5432 2>/dev/null | cut -d: -f2 || echo "N/A")
    
    # Get volumes
    VOLUMES=$(docker volume ls -q | grep "^${instance}_" | wc -l | tr -d ' ')
    
    # Get total volume size
    TOTAL_SIZE="0"
    if [ "$IS_RUNNING" = true ]; then
        VOLUME_NAMES=$(docker volume ls -q | grep "^${instance}_" || true)
        if [ -n "$VOLUME_NAMES" ]; then
            TOTAL_SIZE=$(echo "$VOLUME_NAMES" | while read vol; do
                docker volume inspect "$vol" --format '{{.Mountpoint}}' 2>/dev/null | xargs du -sb 2>/dev/null | cut -f1 || echo "0"
            done | awk '{s+=$1} END {printf "%.1f", s/1024/1024/1024}')
        fi
    fi
    
    # JSON output
    if [ "$JSON_OUTPUT" = true ]; then
        [ "$FIRST_INSTANCE" = false ] && echo ","
        FIRST_INSTANCE=false
        
        echo "    {"
        echo "      \"name\": \"$instance\","
        echo "      \"status\": \"$([ "$IS_RUNNING" = true ] && echo 'running' || echo 'stopped')\","
        echo "      \"containers\": {"
        echo "        \"total\": $CONTAINER_COUNT,"
        echo "        \"running\": $RUNNING_COUNT"
        echo "      },"
        echo "      \"ports\": {"
        echo "        \"studio\": \"$STUDIO_PORT\","
        echo "        \"kong\": \"$KONG_PORT\","
        echo "        \"database\": \"$DB_PORT\""
        echo "      },"
        echo "      \"volumes\": {"
        echo "        \"count\": $VOLUMES,"
        echo "        \"size_gb\": \"$TOTAL_SIZE\""
        echo "      }"
        echo -n "    }"
    else
        # Table output
        if [ "$IS_RUNNING" = true ]; then
            STATUS_ICON="${GREEN}●${NC}"
            STATUS_TEXT="${GREEN}Running${NC}"
        else
            STATUS_ICON="${RED}●${NC}"
            STATUS_TEXT="${RED}Stopped${NC}"
        fi
        
        echo -e "${STATUS_ICON} Instance: ${BLUE}${instance}${NC}"
        echo -e "  Status:     ${STATUS_TEXT}"
        echo "  Containers: ${RUNNING_COUNT}/${CONTAINER_COUNT} running"
        echo "  Ports:      Studio:${STUDIO_PORT} Kong:${KONG_PORT} DB:${DB_PORT}"
        echo "  Volumes:    ${VOLUMES} volumes (${TOTAL_SIZE} GB)"
        
        # List containers
        echo "  Services:"
        docker ps -a --filter "name=${instance}_" --format "    - {{.Names}}: {{.Status}}" | sed "s/${instance}_//"
        
        echo ""
    fi
done

# JSON output closing
if [ "$JSON_OUTPUT" = true ]; then
    echo ""
    echo "  ]"
    echo "}"
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Commands:"
    echo "  Switch instance:  ./scripts/switch-instance.sh <instance-name>"
    echo "  Start instance:   cd docker && ./start.sh"
    echo "  Stop instance:    cd docker && ./stop.sh"
    echo ""
fi

# Testing:
# 1. Create multiple instances with different PROJECT_NAMEs
# 2. Run ./list-instances.sh
# 3. Verify all instances are listed with correct status
# 4. Test --running and --stopped filters
# 5. Test --json output format
# Expected: All instances listed with status, ports, and volumes
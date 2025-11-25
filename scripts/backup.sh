#!/bin/bash
# Script: backup.sh
# Description: Create comprehensive backups of Supabase instance
# Usage: ./backup.sh [options]
#
# Options:
#   --database-only        Backup database only
#   --storage-only         Backup storage only
#   --config-only          Backup configuration only
#   --output <dir>         Output directory (default: ./backups)
#   --compress             Compress backup files
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

# Default backup directory
BACKUP_DIR="$PROJECT_ROOT/backups"

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
    echo "Usage: ./backup.sh [options]"
    echo ""
    echo "Description:"
    echo "  Creates comprehensive backups of your Supabase instance including"
    echo "  database, storage, and configuration files."
    echo ""
    echo "Options:"
    echo "  --database-only        Backup database only"
    echo "  --storage-only         Backup storage only"
    echo "  --config-only          Backup configuration only"
    echo "  --output <dir>         Output directory (default: ./backups)"
    echo "  --compress             Compress backup files"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./backup.sh                        # Full backup"
    echo "  ./backup.sh --database-only        # Database only"
    echo "  ./backup.sh --output /mnt/backups  # Custom location"
    echo "  ./backup.sh --compress             # Compressed backup"
    exit 0
}

# Parse arguments
BACKUP_DATABASE=true
BACKUP_STORAGE=true
BACKUP_CONFIG=true
COMPRESS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --database-only)
            BACKUP_DATABASE=true
            BACKUP_STORAGE=false
            BACKUP_CONFIG=false
            shift
            ;;
        --storage-only)
            BACKUP_DATABASE=false
            BACKUP_STORAGE=true
            BACKUP_CONFIG=false
            shift
            ;;
        --config-only)
            BACKUP_DATABASE=false
            BACKUP_STORAGE=false
            BACKUP_CONFIG=true
            shift
            ;;
        --output)
            BACKUP_DIR="$2"
            shift 2
            ;;
        --compress)
            COMPRESS=true
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

# Create backup directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
INSTANCE_BACKUP_DIR="$BACKUP_DIR/${PROJECT_NAME}/${TIMESTAMP}"
mkdir -p "$INSTANCE_BACKUP_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase Backup - ${PROJECT_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
info "Backup directory: $INSTANCE_BACKUP_DIR"
echo ""

# Check if services are running
DB_CONTAINER="${PROJECT_NAME}_db"
if ! docker ps --format '{{.Names}}' | grep -q "^${DB_CONTAINER}$"; then
    warning "Database container is not running. Some backups may fail."
    echo ""
fi

# Backup database
if [ "$BACKUP_DATABASE" = true ]; then
    info "Backing up PostgreSQL database..."
    
    DB_BACKUP_FILE="$INSTANCE_BACKUP_DIR/postgres_${TIMESTAMP}.dump"
    
    if docker exec "$DB_CONTAINER" pg_dump -U postgres -F c -f /tmp/backup.dump postgres 2>/dev/null; then
        docker cp "${DB_CONTAINER}:/tmp/backup.dump" "$DB_BACKUP_FILE"
        docker exec "$DB_CONTAINER" rm /tmp/backup.dump
        
        DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
        success "Database backed up (${DB_SIZE})"
        
        # Compress if requested
        if [ "$COMPRESS" = true ]; then
            info "Compressing database backup..."
            gzip "$DB_BACKUP_FILE"
            success "Database backup compressed"
        fi
    else
        error "Failed to backup database"
    fi
    
    echo ""
fi

# Backup storage
if [ "$BACKUP_STORAGE" = true ]; then
    info "Backing up MinIO storage..."
    
    STORAGE_BACKUP_DIR="$INSTANCE_BACKUP_DIR/storage"
    mkdir -p "$STORAGE_BACKUP_DIR"
    
    MINIO_CONTAINER="${PROJECT_NAME}_minio"
    
    if docker ps --format '{{.Names}}' | grep -q "^${MINIO_CONTAINER}$"; then
        # Copy MinIO data directory
        MINIO_VOLUME="${PROJECT_NAME}_minio_data"
        
        if docker volume inspect "$MINIO_VOLUME" &>/dev/null; then
            # Create temporary container to access volume
            docker run --rm \
                -v "${MINIO_VOLUME}:/source:ro" \
                -v "${STORAGE_BACKUP_DIR}:/backup" \
                alpine \
                sh -c "cd /source && tar czf /backup/minio_data_${TIMESTAMP}.tar.gz ." 2>/dev/null
            
            STORAGE_SIZE=$(du -h "$STORAGE_BACKUP_DIR/minio_data_${TIMESTAMP}.tar.gz" | cut -f1)
            success "Storage backed up (${STORAGE_SIZE})"
        else
            warning "MinIO volume not found"
        fi
    else
        warning "MinIO container is not running"
    fi
    
    echo ""
fi

# Backup configuration
if [ "$BACKUP_CONFIG" = true ]; then
    info "Backing up configuration files..."
    
    CONFIG_BACKUP_DIR="$INSTANCE_BACKUP_DIR/config"
    mkdir -p "$CONFIG_BACKUP_DIR"
    
    # Backup .env file (with sensitive data masked in log)
    if [ -f "$ENV_FILE" ]; then
        cp "$ENV_FILE" "$CONFIG_BACKUP_DIR/.env"
        success "Backed up .env file"
    fi
    
    # Backup docker-compose files
    if [ -f "$PROJECT_ROOT/docker/docker-compose.yml" ]; then
        cp "$PROJECT_ROOT/docker/docker-compose.yml" "$CONFIG_BACKUP_DIR/"
        success "Backed up docker-compose.yml"
    fi
    
    if [ -f "$PROJECT_ROOT/docker/docker-compose.local.yml" ]; then
        cp "$PROJECT_ROOT/docker/docker-compose.local.yml" "$CONFIG_BACKUP_DIR/"
        success "Backed up docker-compose.local.yml"
    fi
    
    if [ -f "$PROJECT_ROOT/docker/docker-compose.prod.yml" ]; then
        cp "$PROJECT_ROOT/docker/docker-compose.prod.yml" "$CONFIG_BACKUP_DIR/"
        success "Backed up docker-compose.prod.yml"
    fi
    
    # Backup Caddyfile
    if [ -f "$PROJECT_ROOT/caddy/Caddyfile.local" ]; then
        mkdir -p "$CONFIG_BACKUP_DIR/caddy"
        cp "$PROJECT_ROOT/caddy/Caddyfile.local" "$CONFIG_BACKUP_DIR/caddy/"
        success "Backed up Caddyfile.local"
    fi
    
    if [ -f "$PROJECT_ROOT/caddy/Caddyfile.prod" ]; then
        mkdir -p "$CONFIG_BACKUP_DIR/caddy"
        cp "$PROJECT_ROOT/caddy/Caddyfile.prod" "$CONFIG_BACKUP_DIR/caddy/"
        success "Backed up Caddyfile.prod"
    fi
    
    # Backup volume initialization scripts
    if [ -d "$PROJECT_ROOT/docker/volumes" ]; then
        cp -r "$PROJECT_ROOT/docker/volumes" "$CONFIG_BACKUP_DIR/"
        success "Backed up volume initialization scripts"
    fi
    
    echo ""
fi

# Create backup manifest
MANIFEST_FILE="$INSTANCE_BACKUP_DIR/manifest.txt"
cat > "$MANIFEST_FILE" << EOF
Supabase Backup Manifest
========================

Instance: ${PROJECT_NAME}
Timestamp: ${TIMESTAMP}
Date: $(date)

Backup Contents:
EOF

if [ "$BACKUP_DATABASE" = true ]; then
    echo "  - PostgreSQL database" >> "$MANIFEST_FILE"
fi

if [ "$BACKUP_STORAGE" = true ]; then
    echo "  - MinIO storage" >> "$MANIFEST_FILE"
fi

if [ "$BACKUP_CONFIG" = true ]; then
    echo "  - Configuration files" >> "$MANIFEST_FILE"
fi

echo "" >> "$MANIFEST_FILE"
echo "Files:" >> "$MANIFEST_FILE"
find "$INSTANCE_BACKUP_DIR" -type f -exec ls -lh {} \; | awk '{print "  " $9 " (" $5 ")"}' >> "$MANIFEST_FILE"

success "Created backup manifest"

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$INSTANCE_BACKUP_DIR" | cut -f1)

# Apply retention policy
info "Applying retention policy..."

# Keep last 7 daily backups
DAILY_BACKUPS=$(find "$BACKUP_DIR/${PROJECT_NAME}" -maxdepth 1 -type d -name "20*" | sort -r | tail -n +8)
if [ -n "$DAILY_BACKUPS" ]; then
    echo "$DAILY_BACKUPS" | while read old_backup; do
        # Check if it's a weekly backup (Sunday)
        BACKUP_DATE=$(basename "$old_backup" | cut -d_ -f1)
        DAY_OF_WEEK=$(date -d "$BACKUP_DATE" +%u 2>/dev/null || date -j -f "%Y%m%d" "$BACKUP_DATE" +%u 2>/dev/null || echo "0")
        
        if [ "$DAY_OF_WEEK" != "7" ]; then
            rm -rf "$old_backup"
            info "Removed old backup: $(basename $old_backup)"
        fi
    done
fi

success "Retention policy applied"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Backup location: $INSTANCE_BACKUP_DIR"
echo "Total size: $TOTAL_SIZE"
echo ""
echo "To restore from this backup:"
echo "  ./scripts/restore.sh --backup $INSTANCE_BACKUP_DIR"
echo ""

# Testing:
# 1. Start services with ./start.sh
# 2. Run ./backup.sh
# 3. Verify backup directory is created
# 4. Check database dump file exists
# 5. Check storage backup exists
# 6. Check config files are backed up
# 7. Test --database-only, --storage-only, --config-only flags
# Expected: Complete backup created with all components
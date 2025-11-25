#!/bin/bash
# Script: restore.sh
# Description: Restore Supabase instance from backup
# Usage: ./restore.sh [options]
#
# Options:
#   --backup <dir>         Backup directory to restore from
#   --list                 List available backups
#   --database-only        Restore database only
#   --storage-only         Restore storage only
#   --config-only          Restore configuration only
#   --force                Skip confirmation prompts
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
    echo "Usage: ./restore.sh [options]"
    echo ""
    echo "Description:"
    echo "  Restores a Supabase instance from a previous backup."
    echo "  This will OVERWRITE existing data!"
    echo ""
    echo "Options:"
    echo "  --backup <dir>         Backup directory to restore from"
    echo "  --list                 List available backups"
    echo "  --database-only        Restore database only"
    echo "  --storage-only         Restore storage only"
    echo "  --config-only          Restore configuration only"
    echo "  --force                Skip confirmation prompts"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./restore.sh --list                           # List backups"
    echo "  ./restore.sh --backup ./backups/instance/...  # Restore specific backup"
    echo "  ./restore.sh --database-only                  # Restore database only"
    exit 0
}

# List available backups
list_backups() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Available Backups"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "No backups found. Backup directory does not exist: $BACKUP_DIR"
        echo ""
        exit 0
    fi
    
    # Find all backup directories
    BACKUPS=$(find "$BACKUP_DIR" -mindepth 2 -maxdepth 2 -type d -name "20*" | sort -r)
    
    if [ -z "$BACKUPS" ]; then
        echo "No backups found in: $BACKUP_DIR"
        echo ""
        exit 0
    fi
    
    INDEX=1
    echo "$BACKUPS" | while read backup_path; do
        INSTANCE=$(basename "$(dirname "$backup_path")")
        TIMESTAMP=$(basename "$backup_path")
        SIZE=$(du -sh "$backup_path" | cut -f1)
        
        # Read manifest if available
        MANIFEST="$backup_path/manifest.txt"
        CONTENTS="Unknown"
        if [ -f "$MANIFEST" ]; then
            CONTENTS=$(grep -A 10 "Backup Contents:" "$MANIFEST" | tail -n +2 | grep "^  -" | tr '\n' ',' | sed 's/,$//' | sed 's/  - //g')
        fi
        
        echo "  ${INDEX}. Instance: $INSTANCE"
        echo "     Timestamp: $TIMESTAMP"
        echo "     Size: $SIZE"
        echo "     Contents: $CONTENTS"
        echo "     Path: $backup_path"
        echo ""
        
        INDEX=$((INDEX + 1))
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# Parse arguments
BACKUP_PATH=""
RESTORE_DATABASE=true
RESTORE_STORAGE=true
RESTORE_CONFIG=true
FORCE=false
LIST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backup)
            BACKUP_PATH="$2"
            shift 2
            ;;
        --list)
            LIST_ONLY=true
            shift
            ;;
        --database-only)
            RESTORE_DATABASE=true
            RESTORE_STORAGE=false
            RESTORE_CONFIG=false
            shift
            ;;
        --storage-only)
            RESTORE_DATABASE=false
            RESTORE_STORAGE=true
            RESTORE_CONFIG=false
            shift
            ;;
        --config-only)
            RESTORE_DATABASE=false
            RESTORE_STORAGE=false
            RESTORE_CONFIG=true
            shift
            ;;
        --force)
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

# List backups if requested
if [ "$LIST_ONLY" = true ]; then
    list_backups
    exit 0
fi

# Interactive mode if no backup specified
if [ -z "$BACKUP_PATH" ]; then
    list_backups
    
    echo "Enter the backup number or path to restore from (or 'q' to quit):"
    read -p "> " SELECTION
    
    if [ "$SELECTION" = "q" ] || [ "$SELECTION" = "Q" ]; then
        info "Operation cancelled"
        exit 0
    fi
    
    # Check if selection is a number
    if [[ "$SELECTION" =~ ^[0-9]+$ ]]; then
        # Get backup by index
        BACKUPS=$(find "$BACKUP_DIR" -mindepth 2 -maxdepth 2 -type d -name "20*" | sort -r)
        BACKUP_PATH=$(echo "$BACKUPS" | sed -n "${SELECTION}p")
        
        if [ -z "$BACKUP_PATH" ]; then
            error "Invalid selection: $SELECTION"
        fi
    else
        BACKUP_PATH="$SELECTION"
    fi
fi

# Validate backup path
if [ ! -d "$BACKUP_PATH" ]; then
    error "Backup directory not found: $BACKUP_PATH"
fi

# Load environment
if [ ! -f "$ENV_FILE" ]; then
    error ".env file not found at $ENV_FILE"
fi

set -a
source "$ENV_FILE"
set +a

# Confirmation prompt
if [ "$FORCE" = false ]; then
    echo ""
    warning "⚠️  WARNING: This will OVERWRITE existing data!"
    echo ""
    echo "  Backup to restore: $BACKUP_PATH"
    echo "  Target instance: $PROJECT_NAME"
    echo ""
    
    if [ "$RESTORE_DATABASE" = true ]; then
        echo "  - Database will be restored (ALL DATA WILL BE LOST)"
    fi
    
    if [ "$RESTORE_STORAGE" = true ]; then
        echo "  - Storage will be restored (ALL FILES WILL BE LOST)"
    fi
    
    if [ "$RESTORE_CONFIG" = true ]; then
        echo "  - Configuration will be restored"
    fi
    
    echo ""
    echo -e "${RED}THIS OPERATION CANNOT BE UNDONE!${NC}"
    echo ""
    read -p "Type 'yes' to confirm: " -r
    echo ""
    
    if [[ ! $REPLY =~ ^yes$ ]]; then
        info "Operation cancelled"
        exit 0
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Supabase Restore - ${PROJECT_NAME}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Stop services before restore
info "Stopping services..."
cd "$PROJECT_ROOT/docker"
./stop.sh || warning "Failed to stop some services"
cd "$SCRIPT_DIR"
success "Services stopped"
echo ""

# Restore configuration
if [ "$RESTORE_CONFIG" = true ]; then
    info "Restoring configuration files..."
    
    CONFIG_BACKUP_DIR="$BACKUP_PATH/config"
    
    if [ -d "$CONFIG_BACKUP_DIR" ]; then
        # Restore .env
        if [ -f "$CONFIG_BACKUP_DIR/.env" ]; then
            cp "$CONFIG_BACKUP_DIR/.env" "$ENV_FILE"
            success "Restored .env file"
        fi
        
        # Restore docker-compose files
        if [ -f "$CONFIG_BACKUP_DIR/docker-compose.yml" ]; then
            cp "$CONFIG_BACKUP_DIR/docker-compose.yml" "$PROJECT_ROOT/docker/"
            success "Restored docker-compose.yml"
        fi
        
        if [ -f "$CONFIG_BACKUP_DIR/docker-compose.local.yml" ]; then
            cp "$CONFIG_BACKUP_DIR/docker-compose.local.yml" "$PROJECT_ROOT/docker/"
            success "Restored docker-compose.local.yml"
        fi
        
        if [ -f "$CONFIG_BACKUP_DIR/docker-compose.prod.yml" ]; then
            cp "$CONFIG_BACKUP_DIR/docker-compose.prod.yml" "$PROJECT_ROOT/docker/"
            success "Restored docker-compose.prod.yml"
        fi
        
        # Restore Caddyfile
        if [ -d "$CONFIG_BACKUP_DIR/caddy" ]; then
            cp -r "$CONFIG_BACKUP_DIR/caddy/"* "$PROJECT_ROOT/caddy/" 2>/dev/null || true
            success "Restored Caddyfile"
        fi
        
        # Restore volume initialization scripts
        if [ -d "$CONFIG_BACKUP_DIR/volumes" ]; then
            cp -r "$CONFIG_BACKUP_DIR/volumes/"* "$PROJECT_ROOT/docker/volumes/" 2>/dev/null || true
            success "Restored volume initialization scripts"
        fi
        
        # Reload environment after config restore
        set -a
        source "$ENV_FILE"
        set +a
    else
        warning "Configuration backup not found"
    fi
    
    echo ""
fi

# Start services for database and storage restore
if [ "$RESTORE_DATABASE" = true ] || [ "$RESTORE_STORAGE" = true ]; then
    info "Starting services for restore..."
    cd "$PROJECT_ROOT/docker"
    ./start.sh || error "Failed to start services"
    cd "$SCRIPT_DIR"
    
    # Wait for services to be ready
    sleep 10
    success "Services started"
    echo ""
fi

# Restore database
if [ "$RESTORE_DATABASE" = true ]; then
    info "Restoring PostgreSQL database..."
    
    # Find database backup file
    DB_BACKUP=$(find "$BACKUP_PATH" -name "postgres_*.dump*" | head -n 1)
    
    if [ -z "$DB_BACKUP" ]; then
        error "Database backup file not found in $BACKUP_PATH"
    fi
    
    # Decompress if needed
    if [[ "$DB_BACKUP" == *.gz ]]; then
        info "Decompressing database backup..."
        gunzip -c "$DB_BACKUP" > "/tmp/restore.dump"
        DB_BACKUP="/tmp/restore.dump"
    fi
    
    DB_CONTAINER="${PROJECT_NAME}_db"
    
    # Copy backup to container
    docker cp "$DB_BACKUP" "${DB_CONTAINER}:/tmp/restore.dump"
    
    # Drop and recreate database
    docker exec "$DB_CONTAINER" psql -U postgres -c "DROP DATABASE IF EXISTS postgres WITH (FORCE);" 2>/dev/null || true
    docker exec "$DB_CONTAINER" psql -U postgres -c "CREATE DATABASE postgres;" 2>/dev/null || true
    
    # Restore database
    if docker exec "$DB_CONTAINER" pg_restore -U postgres -d postgres -c /tmp/restore.dump 2>/dev/null; then
        success "Database restored"
    else
        warning "Database restore completed with some errors (this is often normal)"
    fi
    
    # Cleanup
    docker exec "$DB_CONTAINER" rm /tmp/restore.dump
    [ -f "/tmp/restore.dump" ] && rm "/tmp/restore.dump"
    
    echo ""
fi

# Restore storage
if [ "$RESTORE_STORAGE" = true ]; then
    info "Restoring MinIO storage..."
    
    STORAGE_BACKUP_DIR="$BACKUP_PATH/storage"
    
    if [ -d "$STORAGE_BACKUP_DIR" ]; then
        STORAGE_BACKUP=$(find "$STORAGE_BACKUP_DIR" -name "minio_data_*.tar.gz" | head -n 1)
        
        if [ -n "$STORAGE_BACKUP" ]; then
            MINIO_VOLUME="${PROJECT_NAME}_minio_data"
            
            # Stop MinIO container
            docker stop "${PROJECT_NAME}_minio" 2>/dev/null || true
            
            # Restore volume data
            docker run --rm \
                -v "${MINIO_VOLUME}:/target" \
                -v "${STORAGE_BACKUP_DIR}:/backup:ro" \
                alpine \
                sh -c "cd /target && rm -rf * && tar xzf /backup/$(basename $STORAGE_BACKUP)" 2>/dev/null
            
            success "Storage restored"
            
            # Restart MinIO
            docker start "${PROJECT_NAME}_minio" 2>/dev/null || true
        else
            warning "Storage backup file not found"
        fi
    else
        warning "Storage backup directory not found"
    fi
    
    echo ""
fi

# Restart services
info "Restarting services..."
cd "$PROJECT_ROOT/docker"
./stop.sh
./start.sh || error "Failed to restart services"
cd "$SCRIPT_DIR"
success "Services restarted"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Restore completed successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Instance: $PROJECT_NAME"
echo "Restored from: $BACKUP_PATH"
echo ""
echo "Next steps:"
echo "  1. Verify services: ./scripts/health-check.sh"
echo "  2. Test functionality"
echo "  3. Check logs if needed: docker-compose logs -f"
echo ""

# Testing:
# 1. Create a backup with ./backup.sh
# 2. Make some changes to database/storage
# 3. Run ./restore.sh --list
# 4. Run ./restore.sh --backup <path>
# 5. Verify data is restored correctly
# 6. Test --database-only, --storage-only, --config-only flags
# Expected: Data restored from backup, services restarted
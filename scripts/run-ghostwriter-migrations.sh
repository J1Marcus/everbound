#!/bin/bash

# Ghostwriter Workflow Migration Runner
# This script applies the ghostwriter database migrations in the correct order
# Usage: ./scripts/run-ghostwriter-migrations.sh [--rollback]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATION_DIR="supabase/migrations/ghostwriter"
DB_CONTAINER="supabase-db"
DB_USER="postgres"
DB_NAME="postgres"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker container is running
check_docker() {
    if ! docker ps | grep -q "$DB_CONTAINER"; then
        print_error "Database container '$DB_CONTAINER' is not running"
        print_info "Start Supabase with: cd docker && docker-compose up -d"
        exit 1
    fi
    print_success "Database container is running"
}

# Function to test database connection
test_connection() {
    print_info "Testing database connection..."
    if docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Cannot connect to database"
        return 1
    fi
}

# Function to run a migration file
run_migration() {
    local file=$1
    local filename=$(basename "$file")
    
    print_info "Running migration: $filename"
    
    if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$file"; then
        print_success "Migration $filename completed"
        return 0
    else
        print_error "Migration $filename failed"
        return 1
    fi
}

# Function to create rollback migration
create_rollback() {
    local migration_num=$1
    local rollback_file="$MIGRATION_DIR/${migration_num}_rollback.sql"
    
    if [ -f "$rollback_file" ]; then
        print_info "Running rollback: $(basename $rollback_file)"
        if docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" < "$rollback_file"; then
            print_success "Rollback completed"
            return 0
        else
            print_error "Rollback failed"
            return 1
        fi
    else
        print_warning "No rollback file found: $rollback_file"
        return 1
    fi
}

# Function to apply all migrations
apply_migrations() {
    print_info "Starting Ghostwriter Workflow migrations..."
    echo ""
    
    local migrations=(
        "001_create_user_profiles.sql"
        "002_create_memoir_sections.sql"
        "003_create_section_prompts.sql"
        "004_create_section_synthesis.sql"
        "005_extend_memory_fragments.sql"
        "006_extend_media_files.sql"
        "007_create_indexes.sql"
        "008_rls_policies.sql"
        "009_seed_data.sql"
    )
    
    local failed=0
    
    for migration in "${migrations[@]}"; do
        local file="$MIGRATION_DIR/$migration"
        
        if [ ! -f "$file" ]; then
            print_error "Migration file not found: $file"
            failed=1
            break
        fi
        
        if ! run_migration "$file"; then
            failed=1
            break
        fi
        echo ""
    done
    
    if [ $failed -eq 0 ]; then
        print_success "All migrations completed successfully!"
        echo ""
        print_info "Next steps:"
        echo "  1. Verify migrations: psql -U postgres -d postgres -c '\dt'"
        echo "  2. Test RLS policies"
        echo "  3. Update frontend TypeScript types if needed"
        return 0
    else
        print_error "Migration failed. Database may be in an inconsistent state."
        print_warning "Consider running rollback: $0 --rollback"
        return 1
    fi
}

# Function to rollback migrations
rollback_migrations() {
    print_warning "Rolling back Ghostwriter Workflow migrations..."
    echo ""
    
    # Rollback in reverse order
    local migrations=(
        "009"
        "008"
        "007"
        "006"
        "005"
        "004"
        "003"
        "002"
        "001"
    )
    
    for migration_num in "${migrations[@]}"; do
        create_rollback "$migration_num"
        echo ""
    done
    
    print_success "Rollback completed"
}

# Function to show migration status
show_status() {
    print_info "Checking migration status..."
    echo ""
    
    print_info "Checking for ghostwriter tables..."
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT 
            table_name,
            CASE 
                WHEN table_name IN ('user_profiles', 'memoir_sections', 'section_prompts', 
                                   'section_synthesis', 'media_files') THEN 'Ghostwriter'
                ELSE 'Core'
            END as table_group
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN (
            'user_profiles', 'memoir_sections', 'section_prompts', 
            'section_synthesis', 'media_files', 'memory_fragments'
        )
        ORDER BY table_group, table_name;
    "
    
    echo ""
    print_info "Checking for new columns in memory_fragments..."
    docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'memory_fragments'
        AND column_name IN (
            'section_id', 'prompt_id', 'photo_id', 'ai_enhanced_content',
            'privacy_level', 'word_count', 'sensory_richness_score', 'emotional_depth_score'
        )
        ORDER BY column_name;
    "
}

# Main script
main() {
    echo ""
    echo "=========================================="
    echo "  Ghostwriter Workflow Migration Runner"
    echo "=========================================="
    echo ""
    
    # Check if running from project root
    if [ ! -d "$MIGRATION_DIR" ]; then
        print_error "Migration directory not found: $MIGRATION_DIR"
        print_info "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check Docker
    check_docker
    
    # Test connection
    if ! test_connection; then
        exit 1
    fi
    
    echo ""
    
    # Parse arguments
    case "${1:-}" in
        --rollback)
            rollback_migrations
            ;;
        --status)
            show_status
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (no args)    Apply all migrations"
            echo "  --rollback   Rollback all migrations"
            echo "  --status     Show migration status"
            echo "  --help       Show this help message"
            echo ""
            ;;
        "")
            apply_migrations
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

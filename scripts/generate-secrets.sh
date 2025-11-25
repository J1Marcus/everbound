#!/bin/bash
# Script: generate-secrets.sh
# Description: Generate secure secrets for Supabase services
# Usage: ./generate-secrets.sh [options]
#
# Options:
#   --production, --prod    Generate production-grade secrets (extra validation)
#   --jwt-only              Regenerate only JWT tokens
#   --show                  Display current secrets (masked)
#   --force                 Overwrite existing secrets without confirmation
#   --help                  Show this help message

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
    echo "Usage: ./generate-secrets.sh [options]"
    echo ""
    echo "Options:"
    echo "  --production, --prod    Generate production-grade secrets (extra validation)"
    echo "  --jwt-only              Regenerate only JWT tokens"
    echo "  --show                  Display current secrets (masked)"
    echo "  --force                 Overwrite existing secrets without confirmation"
    echo "  --help                  Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./generate-secrets.sh              # Generate all secrets"
    echo "  ./generate-secrets.sh --prod       # Generate with production validation"
    echo "  ./generate-secrets.sh --jwt-only   # Regenerate JWT tokens only"
    echo "  ./generate-secrets.sh --show       # Show current secrets"
    exit 0
}

# Generate random password
generate_password() {
    local length=${1:-32}
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-${length}
}

# Generate JWT secret (256-bit)
generate_jwt_secret() {
    openssl rand -base64 32
}

# Generate JWT token with claims
generate_jwt_token() {
    local secret=$1
    local role=$2
    local exp_seconds=${3:-315360000}  # 10 years default
    
    # JWT Header
    local header='{"alg":"HS256","typ":"JWT"}'
    local header_b64=$(echo -n "$header" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    
    # JWT Payload
    local now=$(date +%s)
    local exp=$((now + exp_seconds))
    local payload="{\"role\":\"${role}\",\"iss\":\"supabase\",\"iat\":${now},\"exp\":${exp}}"
    local payload_b64=$(echo -n "$payload" | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    
    # JWT Signature
    local signature_input="${header_b64}.${payload_b64}"
    local signature=$(echo -n "$signature_input" | openssl dgst -sha256 -hmac "$secret" -binary | openssl base64 -e -A | tr '+/' '-_' | tr -d '=')
    
    # Complete JWT
    echo "${header_b64}.${payload_b64}.${signature}"
}

# Show current secrets (masked)
show_secrets() {
    if [ ! -f "$ENV_FILE" ]; then
        error ".env file not found at $ENV_FILE"
    fi
    
    source "$ENV_FILE"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Current Secrets (masked)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "POSTGRES_PASSWORD:     ${POSTGRES_PASSWORD:0:8}...${POSTGRES_PASSWORD: -4}"
    echo "JWT_SECRET:            ${JWT_SECRET:0:8}...${JWT_SECRET: -4}"
    echo "ANON_KEY:              ${ANON_KEY:0:20}...${ANON_KEY: -10}"
    echo "SERVICE_ROLE_KEY:      ${SERVICE_ROLE_KEY:0:20}...${SERVICE_ROLE_KEY: -10}"
    echo "MINIO_ROOT_PASSWORD:   ${MINIO_ROOT_PASSWORD:0:8}...${MINIO_ROOT_PASSWORD: -4}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 0
}

# Parse arguments
PRODUCTION_MODE=false
JWT_ONLY=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --production|--prod)
            PRODUCTION_MODE=true
            shift
            ;;
        --jwt-only)
            JWT_ONLY=true
            shift
            ;;
        --show)
            show_secrets
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

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    if [ ! -f "$PROJECT_ROOT/docker/.env.example" ]; then
        error ".env.example file not found"
    fi
    info "Creating .env file from .env.example..."
    cp "$PROJECT_ROOT/docker/.env.example" "$ENV_FILE"
    success ".env file created"
fi

# Backup existing .env
BACKUP_FILE="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
success "Backed up .env to $BACKUP_FILE"

# Load current environment
source "$ENV_FILE"

# Check if secrets already exist
SECRETS_EXIST=false
if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "<256-bit-secret>" ]; then
    SECRETS_EXIST=true
fi

# Confirm overwrite if secrets exist
if [ "$SECRETS_EXIST" = true ] && [ "$FORCE" = false ]; then
    echo ""
    warning "Secrets already exist in .env file"
    echo ""
    read -p "Do you want to regenerate secrets? This will invalidate existing tokens (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        info "Operation cancelled"
        rm "$BACKUP_FILE"
        exit 0
    fi
fi

echo ""
info "Generating secrets..."
echo ""

# Generate secrets
if [ "$JWT_ONLY" = false ]; then
    # Generate PostgreSQL password
    POSTGRES_PASSWORD=$(generate_password 32)
    success "Generated POSTGRES_PASSWORD"
    
    # Generate MinIO password
    MINIO_ROOT_PASSWORD=$(generate_password 32)
    success "Generated MINIO_ROOT_PASSWORD"
fi

# Generate JWT secret
JWT_SECRET=$(generate_jwt_secret)
success "Generated JWT_SECRET"

# Generate JWT tokens
info "Generating JWT tokens..."
ANON_KEY=$(generate_jwt_token "$JWT_SECRET" "anon")
success "Generated ANON_KEY"

SERVICE_ROLE_KEY=$(generate_jwt_token "$JWT_SECRET" "service_role")
success "Generated SERVICE_ROLE_KEY"

# Update .env file
info "Updating .env file..."

if [ "$JWT_ONLY" = false ]; then
    # Update all secrets
    sed -i.tmp "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" "$ENV_FILE"
    sed -i.tmp "s|^MINIO_ROOT_PASSWORD=.*|MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}|" "$ENV_FILE"
fi

sed -i.tmp "s|^JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|" "$ENV_FILE"
sed -i.tmp "s|^ANON_KEY=.*|ANON_KEY=${ANON_KEY}|" "$ENV_FILE"
sed -i.tmp "s|^SERVICE_ROLE_KEY=.*|SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}|" "$ENV_FILE"

# Clean up temp files
rm -f "${ENV_FILE}.tmp"

success ".env file updated"

# Production mode validation
if [ "$PRODUCTION_MODE" = true ]; then
    info "Running production validation..."
    
    # Check secret lengths
    if [ ${#POSTGRES_PASSWORD} -lt 32 ]; then
        warning "POSTGRES_PASSWORD is shorter than 32 characters"
    fi
    
    if [ ${#MINIO_ROOT_PASSWORD} -lt 32 ]; then
        warning "MINIO_ROOT_PASSWORD is shorter than 32 characters"
    fi
    
    if [ ${#JWT_SECRET} -lt 32 ]; then
        error "JWT_SECRET must be at least 32 characters for production"
    fi
    
    # Verify JWT tokens are valid
    if [ ${#ANON_KEY} -lt 100 ]; then
        error "ANON_KEY appears to be invalid"
    fi
    
    if [ ${#SERVICE_ROLE_KEY} -lt 100 ]; then
        error "SERVICE_ROLE_KEY appears to be invalid"
    fi
    
    success "Production validation passed"
fi

# Display results
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Secrets generated successfully!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$JWT_ONLY" = false ]; then
    echo "Generated secrets:"
    echo "  ✓ POSTGRES_PASSWORD (32 chars)"
    echo "  ✓ MINIO_ROOT_PASSWORD (32 chars)"
    echo "  ✓ JWT_SECRET (44 chars)"
    echo "  ✓ ANON_KEY (JWT token)"
    echo "  ✓ SERVICE_ROLE_KEY (JWT token)"
else
    echo "Regenerated JWT secrets:"
    echo "  ✓ JWT_SECRET (44 chars)"
    echo "  ✓ ANON_KEY (JWT token)"
    echo "  ✓ SERVICE_ROLE_KEY (JWT token)"
fi

echo ""
echo "Backup saved to:"
echo "  $BACKUP_FILE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$SECRETS_EXIST" = true ]; then
    warning "IMPORTANT: Existing tokens have been invalidated!"
    echo "  - Users will need to re-authenticate"
    echo "  - API clients will need updated keys"
    echo "  - Restart services for changes to take effect"
    echo ""
fi

info "Next steps:"
echo "  1. Review the generated secrets in docker/.env"
echo "  2. Start services: cd docker && ./start.sh"
echo "  3. Keep the backup file secure"
echo ""

if [ "$PRODUCTION_MODE" = true ]; then
    warning "Production mode: Ensure secrets are stored securely!"
    echo "  - Use a secrets manager in production"
    echo "  - Never commit .env to version control"
    echo "  - Rotate secrets regularly"
    echo ""
fi

# Testing:
# 1. Run ./generate-secrets.sh
# 2. Verify .env file is updated with new secrets
# 3. Check that backup file is created
# 4. Test --jwt-only flag
# 5. Test --show flag to display secrets
# 6. Test --prod flag for production validation
# Expected: All secrets generated, .env updated, backup created
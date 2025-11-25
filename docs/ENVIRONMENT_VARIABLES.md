# Environment Variables Reference

This document provides comprehensive documentation for all environment variables used in the Supabase self-hosted template.

## Table of Contents

1. [Project Configuration](#project-configuration)
2. [Port Configuration](#port-configuration)
3. [Database Configuration](#database-configuration)
4. [Authentication Configuration](#authentication-configuration)
5. [Storage Configuration](#storage-configuration)
6. [Email Configuration](#email-configuration)
7. [Domain Configuration](#domain-configuration)
8. [Service-Specific Configuration](#service-specific-configuration)
9. [Security Considerations](#security-considerations)
10. [Multi-Instance Configuration](#multi-instance-configuration)

---

## Project Configuration

### PROJECT_NAME

**Description**: Unique identifier for this Supabase instance. Used as prefix for all Docker resources (containers, volumes, networks).

**Required**: Yes (CRITICAL)

**Default**: `supabase_template`

**Example Values**:
```bash
PROJECT_NAME=customer_a_supabase
PROJECT_NAME=customer_b_supabase
PROJECT_NAME=dev_supabase
PROJECT_NAME=staging_supabase
```

**Security Considerations**:
- Must be unique for each instance on the same server
- Prevents container/volume/network name conflicts
- Use descriptive names for easy identification

**Multi-Instance Notes**:
- This is the PRIMARY isolation mechanism
- Each instance MUST have a unique PROJECT_NAME
- Changing this value requires recreating all containers and volumes

---

### ENVIRONMENT

**Description**: Deployment environment type.

**Required**: Yes

**Default**: `local`

**Allowed Values**: `local`, `staging`, `production`

**Example**:
```bash
ENVIRONMENT=production
```

**Notes**:
- Used for conditional configuration
- Affects logging levels and debug settings
- Determines which docker-compose override file to use

---

### PORT_OFFSET

**Description**: Port offset for running multiple instances on the same server. All service ports are calculated as base_port + PORT_OFFSET.

**Required**: No

**Default**: `0`

**Example Values**:
```bash
PORT_OFFSET=0    # First instance (default ports)
PORT_OFFSET=100  # Second instance (ports +100)
PORT_OFFSET=200  # Third instance (ports +200)
```

**Multi-Instance Notes**:
- Use increments of 100 for clear separation
- Automatically calculated by `scripts/calculate-ports.sh`
- Only needed when running multiple instances on same server

**Port Calculations**:
| Service | Base Port | Offset 0 | Offset 100 | Offset 200 |
|---------|-----------|----------|------------|------------|
| PostgreSQL | 5432 | 5432 | 5532 | 5632 |
| Kong HTTP | 8000 | 8000 | 8100 | 8200 |
| Kong HTTPS | 8443 | 8443 | 8543 | 8643 |
| Studio | 3000 | 3000 | 3100 | 3200 |
| MinIO API | 9000 | 9000 | 9100 | 9200 |
| MinIO Console | 9001 | 9001 | 9101 | 9201 |

---

## Port Configuration

These ports are automatically calculated from PORT_OFFSET. You typically don't need to set these manually.

### POSTGRES_PORT
- **Base**: 5432
- **Calculated**: 5432 + PORT_OFFSET
- **Description**: PostgreSQL database port

### KONG_HTTP_PORT
- **Base**: 8000
- **Calculated**: 8000 + PORT_OFFSET
- **Description**: Kong API Gateway HTTP port

### KONG_HTTPS_PORT
- **Base**: 8443
- **Calculated**: 8443 + PORT_OFFSET
- **Description**: Kong API Gateway HTTPS port

### STUDIO_PORT
- **Base**: 3000
- **Calculated**: 3000 + PORT_OFFSET
- **Description**: Supabase Studio web interface port

### MINIO_PORT
- **Base**: 9000
- **Calculated**: 9000 + PORT_OFFSET
- **Description**: MinIO S3 API port

### MINIO_CONSOLE_PORT
- **Base**: 9001
- **Calculated**: 9001 + PORT_OFFSET
- **Description**: MinIO web console port

### REDIS_PORT
- **Base**: 6379
- **Calculated**: 6379 + PORT_OFFSET
- **Description**: Redis cache port

---

## Database Configuration

### POSTGRES_PASSWORD

**Description**: PostgreSQL superuser password.

**Required**: Yes

**Default**: None

**Example**:
```bash
POSTGRES_PASSWORD=your-strong-random-password-here
```

**Security Considerations**:
- Use a strong random password (32+ characters)
- Generate with: `openssl rand -base64 32`
- Never use default or weak passwords
- Store securely (use secrets manager in production)

**Notes**:
- Used by all services connecting to PostgreSQL
- Changing requires database restart and service reconfiguration

---

### POSTGRES_DB

**Description**: PostgreSQL database name.

**Required**: Yes

**Default**: `postgres`

**Example**:
```bash
POSTGRES_DB=postgres
```

**Notes**:
- Default database created on initialization
- Can be changed but requires database recreation

---

### POSTGRES_USER

**Description**: PostgreSQL superuser username.

**Required**: Yes

**Default**: `postgres`

**Example**:
```bash
POSTGRES_USER=postgres
```

**Notes**:
- Superuser with full database access
- Used by all Supabase services

---

### POSTGRES_HOST

**Description**: PostgreSQL host (internal Docker network).

**Required**: Yes

**Default**: `db`

**Example**:
```bash
POSTGRES_HOST=db
```

**Notes**:
- Internal Docker service name
- Do not change unless customizing service names

---

## Authentication Configuration

### JWT_SECRET

**Description**: Secret key for signing JWT tokens.

**Required**: Yes (CRITICAL)

**Default**: None

**Example**:
```bash
JWT_SECRET=your-256-bit-secret-here
```

**Security Considerations**:
- MUST be at least 256 bits (32 bytes)
- Generate with: `openssl rand -base64 32`
- Keep absolutely secret - compromise allows token forgery
- Changing invalidates all existing tokens
- Use different secrets for each environment

**Notes**:
- Used by GoTrue, PostgREST, and Realtime
- Critical for authentication security

---

### ANON_KEY

**Description**: JWT token with 'anon' role for anonymous/public access.

**Required**: Yes

**Default**: None

**Example**:
```bash
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Considerations**:
- Safe to expose in client-side code
- Has limited permissions (read-only by default)
- Respects row-level security policies
- Generate with `scripts/generate-secrets.sh`

**Token Claims**:
```json
{
  "role": "anon",
  "iss": "supabase",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

### SERVICE_ROLE_KEY

**Description**: JWT token with 'service_role' for server-side operations.

**Required**: Yes

**Default**: None

**Example**:
```bash
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Security Considerations**:
- NEVER expose in client-side code
- Bypasses row-level security
- Has full database access
- Keep extremely secure
- Only use in trusted server environments
- Generate with `scripts/generate-secrets.sh`

**Token Claims**:
```json
{
  "role": "service_role",
  "iss": "supabase",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

### SITE_URL

**Description**: Primary URL for your application (used for auth redirects).

**Required**: Yes

**Default**: `http://localhost:3000`

**Example Values**:
```bash
# Local development
SITE_URL=http://localhost:3000

# Production
SITE_URL=https://yourdomain.com
```

**Notes**:
- Used for email confirmation links
- OAuth redirect URLs
- Password reset links
- Must match your application's URL

---

### ADDITIONAL_REDIRECT_URLS

**Description**: Additional allowed redirect URLs for authentication (comma-separated).

**Required**: No

**Default**: Empty

**Example**:
```bash
ADDITIONAL_REDIRECT_URLS=https://app.yourdomain.com,https://admin.yourdomain.com
```

**Notes**:
- Useful for multiple frontend applications
- Must be comma-separated
- Include protocol (http:// or https://)

---

### JWT_EXPIRY

**Description**: JWT token expiration time in seconds.

**Required**: No

**Default**: `3600` (1 hour)

**Example Values**:
```bash
JWT_EXPIRY=3600   # 1 hour
JWT_EXPIRY=7200   # 2 hours
JWT_EXPIRY=86400  # 24 hours
```

**Security Considerations**:
- Shorter expiry = more secure but more frequent re-authentication
- Longer expiry = better UX but higher security risk
- Balance based on your security requirements

---

## Storage Configuration

### STORAGE_BACKEND

**Description**: Storage backend type.

**Required**: Yes

**Default**: `s3`

**Allowed Values**: `s3`, `file`

**Example**:
```bash
STORAGE_BACKEND=s3
```

**Notes**:
- Use `s3` for MinIO (S3-compatible)
- `file` for local filesystem (not recommended for production)

---

### STORAGE_S3_ENDPOINT

**Description**: S3/MinIO endpoint URL (internal Docker network).

**Required**: Yes (when using S3 backend)

**Default**: `http://minio:9000`

**Example**:
```bash
STORAGE_S3_ENDPOINT=http://minio:9000
```

**Notes**:
- Internal Docker service name
- Do not use external URL

---

### STORAGE_S3_BUCKET

**Description**: Default S3/MinIO bucket name for storage.

**Required**: Yes

**Default**: `supabase-storage`

**Example**:
```bash
STORAGE_S3_BUCKET=supabase-storage
```

**Notes**:
- Bucket is created automatically on initialization
- Can be changed but requires bucket recreation

---

### MINIO_ROOT_USER

**Description**: MinIO root username.

**Required**: Yes

**Default**: `minioadmin`

**Example**:
```bash
MINIO_ROOT_USER=minioadmin
```

**Security Considerations**:
- Change from default in production
- Use descriptive username

---

### MINIO_ROOT_PASSWORD

**Description**: MinIO root password.

**Required**: Yes

**Default**: None

**Example**:
```bash
MINIO_ROOT_PASSWORD=your-strong-random-password-here
```

**Security Considerations**:
- Use strong random password (32+ characters)
- Generate with: `openssl rand -base64 32`
- Never use default password
- Store securely

---

## Email Configuration

### SMTP_HOST

**Description**: SMTP server hostname for sending emails.

**Required**: Yes (for email functionality)

**Default**: `smtp.example.com`

**Example Values**:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_HOST=smtp.sendgrid.net
SMTP_HOST=smtp.mailgun.org
```

**Notes**:
- Required for authentication emails
- Password reset emails
- Email confirmations

---

### SMTP_PORT

**Description**: SMTP server port.

**Required**: Yes (for email functionality)

**Default**: `587`

**Common Values**:
- `587` - TLS (recommended)
- `465` - SSL
- `25` - Unencrypted (not recommended)

**Example**:
```bash
SMTP_PORT=587
```

---

### SMTP_USER

**Description**: SMTP username (usually email address).

**Required**: Yes (for email functionality)

**Default**: `noreply@example.com`

**Example**:
```bash
SMTP_USER=noreply@yourdomain.com
```

---

### SMTP_PASS

**Description**: SMTP password or API key.

**Required**: Yes (for email functionality)

**Default**: None

**Example**:
```bash
SMTP_PASS=your-smtp-password-or-api-key
```

**Security Considerations**:
- Keep secure
- Use API keys when available
- Rotate regularly

---

### SMTP_ADMIN_EMAIL

**Description**: Admin email address for system notifications.

**Required**: Yes

**Default**: `admin@example.com`

**Example**:
```bash
SMTP_ADMIN_EMAIL=admin@yourdomain.com
```

---

## Domain Configuration

### API_EXTERNAL_URL

**Description**: External URL for accessing the API Gateway.

**Required**: Yes

**Default**: `http://localhost:8000`

**Example Values**:
```bash
# Local development
API_EXTERNAL_URL=http://localhost:8000

# Production
API_EXTERNAL_URL=https://api.yourdomain.com
```

**Notes**:
- Used by clients to connect to API
- Must be accessible from client applications
- Include protocol (http:// or https://)

---

### STUDIO_EXTERNAL_URL

**Description**: External URL for accessing Supabase Studio.

**Required**: Yes

**Default**: `http://localhost:3000`

**Example Values**:
```bash
# Local development
STUDIO_EXTERNAL_URL=http://localhost:3000

# Production
STUDIO_EXTERNAL_URL=https://studio.yourdomain.com
```

**Notes**:
- Web interface for database management
- Should be secured in production

---

## Security Considerations

### General Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong random passwords** for all credentials
3. **Rotate secrets regularly** in production
4. **Use HTTPS in production** for all external URLs
5. **Restrict Studio access** in production (IP whitelist, VPN)
6. **Keep SERVICE_ROLE_KEY secret** - never expose to clients
7. **Use different secrets** for each environment
8. **Enable firewall rules** in production
9. **Regular security audits** of configuration
10. **Monitor access logs** for suspicious activity

### Secret Generation

Use the provided script to generate secure secrets:

```bash
./scripts/generate-secrets.sh
```

Or manually:

```bash
# Generate random password
openssl rand -base64 32

# Generate JWT secret
openssl rand -base64 32
```

---

## Multi-Instance Configuration

### Running Multiple Instances

To run multiple Supabase instances on the same server:

1. **Create separate directories** for each instance
2. **Use unique PROJECT_NAME** for each instance
3. **Use different PORT_OFFSET** for each instance
4. **Use separate .env files** for each instance

### Example: Three Instances

**Instance 1: Customer A (Production)**
```bash
PROJECT_NAME=customer_a_prod
PORT_OFFSET=0
API_EXTERNAL_URL=https://api-customer-a.yourdomain.com
STUDIO_EXTERNAL_URL=https://studio-customer-a.yourdomain.com
```

**Instance 2: Customer B (Production)**
```bash
PROJECT_NAME=customer_b_prod
PORT_OFFSET=100
API_EXTERNAL_URL=https://api-customer-b.yourdomain.com
STUDIO_EXTERNAL_URL=https://studio-customer-b.yourdomain.com
```

**Instance 3: Development**
```bash
PROJECT_NAME=dev_supabase
PORT_OFFSET=200
API_EXTERNAL_URL=http://localhost:8200
STUDIO_EXTERNAL_URL=http://localhost:3200
```

### Verification

Use the validation script before starting:

```bash
./scripts/validate-instance.sh
```

List all running instances:

```bash
./scripts/list-instances.sh
```

---

## Troubleshooting

### Common Issues

**Issue**: Container name conflicts
- **Solution**: Ensure PROJECT_NAME is unique for each instance

**Issue**: Port already in use
- **Solution**: Use different PORT_OFFSET or stop conflicting service

**Issue**: Authentication not working
- **Solution**: Verify JWT_SECRET, ANON_KEY, and SERVICE_ROLE_KEY are correctly set

**Issue**: Email not sending
- **Solution**: Verify SMTP configuration and credentials

**Issue**: Storage upload fails
- **Solution**: Check MinIO credentials and bucket configuration

### Getting Help

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed troubleshooting guide.

---

## See Also

- [SETUP.md](SETUP.md) - Setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
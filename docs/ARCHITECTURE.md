# Supabase Self-Hosted Architecture

Comprehensive architecture documentation for self-hosted Supabase instances.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [Network Architecture](#network-architecture)
- [Security Architecture](#security-architecture)
- [Storage Architecture](#storage-architecture)
- [Scalability](#scalability)
- [High Availability](#high-availability)
- [Monitoring and Observability](#monitoring-and-observability)

## Overview

### Architecture Principles

1. **Containerized**: All services run in Docker containers
2. **Microservices**: Each component is independently deployable
3. **API Gateway**: Single entry point via Kong
4. **Stateless Services**: Services can be scaled horizontally
5. **Persistent Storage**: Data persists in Docker volumes

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Database | PostgreSQL | 15.1 | Primary data store |
| API Gateway | Kong | 3.4 | Request routing & management |
| Auth | GoTrue | 2.99 | Authentication service |
| REST API | PostgREST | 11.2 | Automatic REST API |
| Realtime | Realtime | 2.25 | WebSocket server |
| Storage | Storage API | 0.43 | File management |
| Object Storage | MinIO | Latest | S3-compatible storage |
| Cache | Redis | 7 | Caching & message queue |
| Functions | Edge Runtime | 1.22 | Serverless functions |
| Meta | Postgres Meta | 0.68 | Database metadata |
| Studio | Studio | Latest | Web dashboard |
| Reverse Proxy | Caddy | 2 | HTTPS & routing |

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Web App  │  │ Mobile   │  │  CLI     │  │  Studio  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    Caddy (Reverse Proxy)  │
        │    - HTTPS/SSL            │
        │    - Load Balancing       │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │    Kong (API Gateway)     │
        │    - Routing              │
        │    - Rate Limiting        │
        │    - Authentication       │
        └─────────────┬─────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
┌───────▼────────┐         ┌────────▼────────┐
│  Service Layer │         │  Management     │
│                │         │                 │
│ ┌────────────┐ │         │ ┌─────────────┐│
│ │  GoTrue    │ │         │ │   Studio    ││
│ │  (Auth)    │ │         │ │ (Dashboard) ││
│ └──────┬─────┘ │         │ └──────┬──────┘│
│        │       │         │        │       │
│ ┌──────▼─────┐ │         │ ┌──────▼──────┐│
│ │ PostgREST  │ │         │ │    Meta     ││
│ │ (REST API) │ │         │ │  (Metadata) ││
│ └──────┬─────┘ │         │ └──────┬──────┘│
│        │       │         └────────┼───────┘
│ ┌──────▼─────┐ │                  │
│ │  Realtime  │ │                  │
│ │ (WebSocket)│ │                  │
│ └──────┬─────┘ │                  │
│        │       │                  │
│ ┌──────▼─────┐ │                  │
│ │  Storage   │ │                  │
│ │   (Files)  │ │                  │
│ └──────┬─────┘ │                  │
│        │       │                  │
│ ┌──────▼─────┐ │                  │
│ │ Functions  │ │                  │
│ │ (Serverless)│ │                 │
│ └──────┬─────┘ │                  │
└────────┼───────┘                  │
         │                          │
         └──────────┬───────────────┘
                    │
        ┌───────────▼────────────┐
        │    Data Layer          │
        │                        │
        │  ┌──────────────────┐  │
        │  │   PostgreSQL     │  │
        │  │   (Database)     │  │
        │  └────────┬─────────┘  │
        │           │            │
        │  ┌────────▼─────────┐  │
        │  │      Redis       │  │
        │  │     (Cache)      │  │
        │  └────────┬─────────┘  │
        │           │            │
        │  ┌────────▼─────────┐  │
        │  │      MinIO       │  │
        │  │  (Object Store)  │  │
        │  └──────────────────┘  │
        └────────────────────────┘
```

### Container Architecture

```
Docker Host
├── Network: supabase_default
│   ├── db (PostgreSQL)
│   ├── redis (Redis)
│   ├── minio (MinIO)
│   ├── kong (API Gateway)
│   ├── gotrue (Auth)
│   ├── postgrest (REST API)
│   ├── realtime (WebSocket)
│   ├── storage (Storage API)
│   ├── functions (Edge Functions)
│   ├── meta (Meta API)
│   ├── studio (Dashboard)
│   └── caddy (Reverse Proxy)
│
├── Volumes
│   ├── db_data (PostgreSQL data)
│   ├── redis_data (Redis persistence)
│   ├── minio_data (Object storage)
│   ├── caddy_data (SSL certificates)
│   └── caddy_logs (Access logs)
│
└── Port Mappings
    ├── 80:80 (HTTP)
    ├── 443:443 (HTTPS)
    ├── 3000:3000 (Studio)
    ├── 8000:8000 (API Gateway)
    └── 5432:5432 (PostgreSQL - optional)
```

## Component Details

### 1. PostgreSQL Database

**Purpose**: Primary data store with extensions for Supabase functionality.

**Key Features**:
- Row Level Security (RLS)
- Logical replication for realtime
- Full-text search
- JSON/JSONB support
- PostGIS for geospatial data

**Extensions**:
- `uuid-ossp`: UUID generation
- `pgcrypto`: Cryptographic functions
- `pgjwt`: JWT token handling
- `pg_net`: HTTP client
- `pgsodium`: Encryption
- `pg_graphql`: GraphQL support
- `pg_stat_statements`: Query statistics

**Schemas**:
- `public`: Application data
- `auth`: User authentication
- `storage`: File metadata
- `realtime`: Realtime subscriptions
- `supabase_functions`: Function metadata
- `graphql_public`: GraphQL schema

**Configuration**:
```yaml
services:
  db:
    image: supabase/postgres:15.1.0.147
    ports:
      - "127.0.0.1:${POSTGRES_PORT}:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
```

### 2. Kong API Gateway

**Purpose**: Single entry point for all API requests with routing and rate limiting.

**Key Features**:
- Request routing to backend services
- Rate limiting per API key
- Request/response transformation
- Authentication verification
- Load balancing

**Routes**:
- `/auth/v1/*` → GoTrue (Authentication)
- `/rest/v1/*` → PostgREST (REST API)
- `/realtime/v1/*` → Realtime (WebSocket)
- `/storage/v1/*` → Storage (Files)
- `/functions/v1/*` → Functions (Serverless)

**Configuration**:
```yaml
services:
  kong:
    image: kong:3.4-alpine
    ports:
      - "127.0.0.1:${KONG_HTTP_PORT}:8000"
      - "127.0.0.1:${KONG_HTTPS_PORT}:8443"
    environment:
      KONG_DATABASE: "off"
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
```

### 3. GoTrue (Authentication)

**Purpose**: User authentication and management service.

**Key Features**:
- Email/password authentication
- OAuth provider integration
- Magic link authentication
- JWT token generation
- User management
- Email confirmation
- Password recovery

**Supported OAuth Providers**:
- Google, GitHub, GitLab, Bitbucket
- Azure, Facebook, Twitter
- Discord, Twitch, Slack

**Configuration**:
```yaml
services:
  gotrue:
    image: supabase/gotrue:v2.99.0
    environment:
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_SMTP_HOST: ${SMTP_HOST}
```

### 4. PostgREST (REST API)

**Purpose**: Automatic REST API generation from PostgreSQL schema.

**Key Features**:
- Automatic CRUD operations
- Complex queries via URL parameters
- Row Level Security enforcement
- OpenAPI documentation
- Bulk operations
- Stored procedure calls

**Query Capabilities**:
- Filtering (eq, neq, gt, lt, like, in)
- Ordering (asc, desc)
- Pagination (limit, offset, range)
- Joins (foreign key relationships)
- Aggregations (count, sum, avg)

**Configuration**:
```yaml
services:
  postgrest:
    image: postgrest/postgrest:v11.2.2
    environment:
      PGRST_DB_URI: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/postgres
      PGRST_DB_SCHEMAS: ${PGRST_DB_SCHEMAS}
      PGRST_JWT_SECRET: ${JWT_SECRET}
```

### 5. Realtime Server

**Purpose**: WebSocket server for real-time database changes and messaging.

**Key Features**:
- Database change subscriptions
- Broadcast channels
- Presence tracking
- Low latency updates
- Automatic reconnection

**Use Cases**:
- Live data updates
- Chat applications
- Collaborative editing
- User presence
- Notifications

**Configuration**:
```yaml
services:
  realtime:
    image: supabase/realtime:v2.25.35
    environment:
      DB_HOST: db
      DB_PORT: 5432
      REPLICATION_MODE: RLS
      REDIS_HOST: redis
```

### 6. Storage API

**Purpose**: File storage management with access control.

**Key Features**:
- File upload/download
- Access control policies
- Image transformations
- Signed URLs
- Bucket management
- File versioning

**Storage Backend**: MinIO (S3-compatible)

**Configuration**:
```yaml
services:
  storage:
    image: supabase/storage-api:v0.43.11
    environment:
      STORAGE_BACKEND: s3
      STORAGE_S3_ENDPOINT: http://minio:9000
      FILE_SIZE_LIMIT: 52428800
```

### 7. MinIO (Object Storage)

**Purpose**: S3-compatible object storage for files.

**Key Features**:
- S3-compatible API
- Bucket management
- Versioning
- Lifecycle policies
- Web console

**Configuration**:
```yaml
services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    ports:
      - "127.0.0.1:${MINIO_PORT}:9000"
      - "127.0.0.1:${MINIO_CONSOLE_PORT}:9001"
    volumes:
      - minio_data:/data
```

### 8. Redis (Cache)

**Purpose**: Caching and message queue for realtime.

**Key Features**:
- In-memory caching
- Pub/sub messaging
- Session storage
- Rate limiting data
- AOF persistence

**Configuration**:
```yaml
services:
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

### 9. Edge Functions Runtime

**Purpose**: Serverless function execution with Deno.

**Key Features**:
- TypeScript/JavaScript support
- HTTP triggers
- Database access
- Third-party API calls
- Environment variables

**Configuration**:
```yaml
services:
  functions:
    image: supabase/edge-runtime:v1.22.4
    volumes:
      - ./volumes/functions:/home/deno/functions
    environment:
      SUPABASE_URL: http://kong:8000
      SUPABASE_ANON_KEY: ${ANON_KEY}
```

### 10. Meta API

**Purpose**: Database metadata and migration management.

**Key Features**:
- Schema introspection
- Migration management
- Table/column metadata
- Database health checks

**Configuration**:
```yaml
services:
  meta:
    image: supabase/postgres-meta:v0.68.0
    environment:
      PG_META_DB_HOST: db
      PG_META_DB_PORT: 5432
```

### 11. Studio (Dashboard)

**Purpose**: Web-based management interface.

**Key Features**:
- Table editor
- SQL editor
- API documentation
- Authentication management
- Storage browser
- Function management

**Configuration**:
```yaml
services:
  studio:
    image: supabase/studio:20231123-64a766a
    ports:
      - "127.0.0.1:${STUDIO_PORT}:3000"
    environment:
      SUPABASE_URL: http://kong:8000
      STUDIO_PG_META_URL: http://meta:8080
```

### 12. Caddy (Reverse Proxy)

**Purpose**: HTTPS termination and request routing.

**Key Features**:
- Automatic HTTPS with Let's Encrypt
- HTTP/2 support
- Load balancing
- Access logging
- Security headers

**Configuration**:
```yaml
services:
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile.prod:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_logs:/var/log/caddy
```

## Data Flow

### Request Flow

```
1. Client Request
   ↓
2. Caddy (HTTPS termination)
   ↓
3. Kong (API Gateway)
   - Verify API key
   - Check rate limits
   - Route to service
   ↓
4. Service Layer
   - GoTrue: Authenticate user
   - PostgREST: Query database
   - Storage: Manage files
   - Realtime: WebSocket connection
   - Functions: Execute code
   ↓
5. Data Layer
   - PostgreSQL: Read/write data
   - Redis: Cache/pub-sub
   - MinIO: Store files
   ↓
6. Response
   ↓
7. Client
```

### Authentication Flow

```
1. User submits credentials
   ↓
2. Request → Kong → GoTrue
   ↓
3. GoTrue validates credentials
   ↓
4. GoTrue queries PostgreSQL (auth schema)
   ↓
5. GoTrue generates JWT token
   ↓
6. JWT returned to client
   ↓
7. Client includes JWT in subsequent requests
   ↓
8. Kong/Services verify JWT signature
   ↓
9. Request processed with user context
```

### Realtime Subscription Flow

```
1. Client opens WebSocket connection
   ↓
2. Connection → Kong → Realtime
   ↓
3. Client subscribes to table/channel
   ↓
4. Realtime registers subscription
   ↓
5. Database change occurs
   ↓
6. PostgreSQL logical replication
   ↓
7. Realtime receives change notification
   ↓
8. Realtime filters by RLS policies
   ↓
9. Realtime pushes to subscribed clients
   ↓
10. Client receives update
```

### File Upload Flow

```
1. Client uploads file
   ↓
2. Request → Kong → Storage API
   ↓
3. Storage API validates request
   ↓
4. Storage API checks policies (PostgreSQL)
   ↓
5. Storage API uploads to MinIO
   ↓
6. Storage API saves metadata (PostgreSQL)
   ↓
7. Success response to client
```

## Network Architecture

### Docker Network

All services communicate via Docker's internal network:

```
Network: supabase_default (bridge)
├── db (PostgreSQL) - Internal only
├── redis - Internal only
├── minio - Internal only
├── kong - Exposed: 8000, 8443
├── gotrue - Internal only
├── postgrest - Internal only
├── realtime - Internal only
├── storage - Internal only
├── functions - Internal only
├── meta - Internal only
├── studio - Exposed: 3000
└── caddy - Exposed: 80, 443
```

### Port Mapping

**External (Host) → Internal (Container)**:

| Service | External | Internal | Protocol |
|---------|----------|----------|----------|
| Caddy HTTP | 80 | 80 | HTTP |
| Caddy HTTPS | 443 | 443 | HTTPS |
| Studio | 3000 | 3000 | HTTP |
| Kong HTTP | 8000 | 8000 | HTTP |
| Kong HTTPS | 8443 | 8443 | HTTPS |
| PostgreSQL | 5432* | 5432 | TCP |

*Optional, typically not exposed in production

### Service Communication

Services use Docker DNS for internal communication:

```bash
# Example: PostgREST connecting to PostgreSQL
postgresql://postgres:password@db:5432/postgres

# Example: Storage connecting to MinIO
http://minio:9000

# Example: Realtime connecting to Redis
redis://redis:6379
```

## Security Architecture

### Authentication Layers

1. **API Key Authentication**
   - All requests require valid API key
   - ANON_KEY for client-side
   - SERVICE_ROLE_KEY for server-side

2. **JWT Token Authentication**
   - User authentication via JWT
   - Tokens signed with JWT_SECRET
   - Tokens include user claims

3. **Row Level Security (RLS)**
   - Database-level access control
   - Policies based on user context
   - Enforced by PostgreSQL

### Security Boundaries

```
┌─────────────────────────────────────┐
│         Internet (Untrusted)        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Caddy (HTTPS Termination)        │
│    - SSL/TLS encryption             │
│    - Security headers               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Kong (API Gateway)                │
│    - API key validation             │
│    - Rate limiting                  │
│    - JWT verification               │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Service Layer (Trusted)          │
│    - Internal network only          │
│    - Service-to-service auth        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│    Data Layer (Most Trusted)        │
│    - No external access             │
│    - Encrypted at rest              │
└─────────────────────────────────────┘
```

### Security Best Practices

1. **Secrets Management**
   - Never commit secrets to git
   - Use strong, unique passwords
   - Rotate secrets regularly
   - Use environment variables

2. **Network Security**
   - Expose only necessary ports
   - Use firewall rules
   - Internal services not exposed
   - HTTPS for all external traffic

3. **Database Security**
   - Enable Row Level Security
   - Use prepared statements
   - Limit connection pool size
   - Regular backups

4. **Application Security**
   - Validate all inputs
   - Sanitize user data
   - Use parameterized queries
   - Implement rate limiting

## Storage Architecture

### Data Persistence

```
Docker Volumes (Persistent)
├── db_data
│   └── PostgreSQL data files
│       ├── Tables
│       ├── Indexes
│       └── WAL logs
│
├── redis_data
│   └── Redis AOF file
│
├── minio_data
│   └── Object storage
│       └── Buckets
│           └── Files
│
├── caddy_data
│   └── SSL certificates
│
└── caddy_logs
    └── Access logs
```

### Backup Strategy

1. **Database Backups**
   - pg_dump for logical backups
   - WAL archiving for point-in-time recovery
   - Daily automated backups
   - Retention: 7 daily, 4 weekly, 12 monthly

2. **Storage Backups**
   - MinIO bucket snapshots
   - File-level backups
   - Incremental backups

3. **Configuration Backups**
   - Environment files
   - Docker compose files
   - Caddy configuration

## Scalability

### Horizontal Scaling

**Stateless Services** (can be scaled):
- Kong (API Gateway)
- PostgREST (REST API)
- GoTrue (Auth)
- Storage API
- Edge Functions

**Stateful Services** (require special handling):
- PostgreSQL (replication)
- Redis (clustering)
- MinIO (distributed mode)

### Vertical Scaling

Increase resources per container:

```yaml
services:
  db:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

### Load Balancing

```
                    ┌─────────────┐
                    │   Caddy     │
                    │ (Load Bal.) │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
       ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
       │ Kong 1  │    │ Kong 2  │   │ Kong 3  │
       └────┬────┘    └────┬────┘   └────┬────┘
            │              │              │
            └──────────────┼──────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL │
                    │  (Primary)  │
                    └─────────────┘
```

## High Availability

### Database HA

```
┌─────────────┐     Replication    ┌─────────────┐
│ PostgreSQL  │ ─────────────────→ │ PostgreSQL  │
│  (Primary)  │                    │  (Replica)  │
└─────────────┘                    └─────────────┘
      │                                    │
      └────────────────┬───────────────────┘
                       │
                  ┌────▼────┐
                  │  Failover│
                  │  Manager │
                  └─────────┘
```

### Service HA

- Multiple instances behind load balancer
- Health checks for automatic failover
- Graceful degradation
- Circuit breakers

### Backup HA

- Multiple backup locations
- Offsite backups
- Regular restore testing
- Automated backup verification

## Monitoring and Observability

### Metrics to Monitor

1. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network traffic

2. **Service Metrics**
   - Request rate
   - Response time
   - Error rate
   - Queue depth

3. **Database Metrics**
   - Connection count
   - Query performance
   - Cache hit ratio
   - Replication lag

4. **Business Metrics**
   - Active users
   - API usage
   - Storage usage
   - Function invocations

### Logging

```
Logs Collection
├── Application Logs
│   ├── Kong access logs
│   ├── Service error logs
│   └── Function logs
│
├── System Logs
│   ├── Docker logs
│   ├── System logs
│   └── Audit logs
│
└── Aggregation
    ├── Centralized logging
    ├── Log analysis
    └── Alerting
```

### Health Checks

```bash
# Automated health check script
./scripts/health-check.sh

# Checks:
# - Container status
# - Service endpoints
# - Database connectivity
# - Redis connectivity
# - Storage accessibility
```

## Additional Resources

- [Setup Guide](SETUP.md) - Initial setup
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [API Reference](API_REFERENCE.md) - API documentation
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues
- [Backup & Recovery](BACKUP_RECOVERY.md) - Backup procedures

## Support

- **Health Check**: `./scripts/health-check.sh`
- **Logs**: `docker compose logs -f [service]`
- **Monitoring**: Access Studio for visual monitoring
- **Community**: [Supabase Discord](https://discord.supabase.com)

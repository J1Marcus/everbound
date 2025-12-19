# Digital Memoir Platform - Setup Guide (Supabase)

**Version:** 2.0
**Last Updated:** 2025-12-19
**Status:** Authoritative

> **✅ This project uses Supabase!** See [`SUPABASE_IMPLEMENTATION_PLAN.md`](../SUPABASE_IMPLEMENTATION_PLAN.md) for complete details.

## Document Purpose

This document provides step-by-step setup instructions for developers getting started with the Digital Memoir Platform using the self-hosted Supabase stack.

---

## 1. Prerequisites

### 1.1 System Requirements

**Minimum Requirements:**
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 50 GB available
- **OS:** macOS, Linux, or Windows with WSL2

**Recommended Requirements:**
- **CPU:** 8+ cores
- **RAM:** 16+ GB
- **Storage:** 100+ GB SSD
- **OS:** macOS or Linux

### 1.2 Required Software

**Core Dependencies:**
- **Docker:** 20.10+ with Docker Compose
- **Git:** 2.30+
- **Node.js:** 18+ (for frontend development)
- **PostgreSQL Client:** 15+ (for database management - optional)

**Optional Tools:**
- **VS Code** or preferred IDE
- **Supabase CLI** (for migrations and functions)
- **pgAdmin** or similar database GUI
- **Postman** or similar API testing tool

### 1.3 External Services

**Required:**
- **LLM API Access:** OpenAI API key or Anthropic API key for Edge Functions
- **SMTP Server:** For email notifications (Gmail, SendGrid, etc.)

**Optional:**
- **Speech-to-Text API:** OpenAI Whisper or Google Speech-to-Text
- **Print Service Account:** Blurb, Lulu, or IngramSpark

---

## 2. Quick Start (Local Development)

### 2.1 Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/digital-memoir-platform.git
cd digital-memoir-platform

# Checkout main branch
git checkout main
```

### 2.2 Supabase Environment Setup

```bash
# Navigate to docker directory
cd docker

# Copy environment template
cp .env.example .env

# Generate secure secrets
../scripts/generate-secrets.sh

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables (docker/.env):**
```bash
# Project Configuration
PROJECT_NAME=memoirs_dev
ENVIRONMENT=development

# Database
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=postgres
POSTGRES_HOST=db
POSTGRES_PORT=5432

# JWT Authentication (Supabase)
JWT_SECRET=your-256-bit-secret
JWT_EXPIRY=3600
ANON_KEY=your-anon-jwt-token
SERVICE_ROLE_KEY=your-service-role-jwt-token

# API URLs
API_EXTERNAL_URL=http://localhost:8000
SUPABASE_PUBLIC_URL=http://localhost:8000
SITE_URL=http://localhost:3000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# LLM API (for Edge Functions)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Kong Ports
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

# Studio Port
STUDIO_PORT=3000
```

### 2.3 Start Supabase Stack

```bash
# From docker directory
cd docker

# Start all Supabase services
docker-compose up -d

# Wait for services to be ready (takes ~30 seconds)
sleep 30

# Check service health
docker-compose ps

# View logs
docker-compose logs -f
```

**Expected Services:**
- `supabase-db` - PostgreSQL database
- `supabase-kong` - API Gateway
- `supabase-auth` - GoTrue authentication
- `supabase-rest` - PostgREST API
- `supabase-realtime` - Realtime server
- `supabase-storage` - Storage API
- `supabase-edge-functions` - Edge Functions runtime
- `supabase-studio` - Database management UI
- `supabase-analytics` - Logflare analytics

### 2.4 Access Supabase Studio

```bash
# Open Supabase Studio in browser
open http://localhost:3000

# Or manually navigate to:
# http://localhost:3000
```

**Studio Features:**
- Table Editor: Create and manage database tables
- SQL Editor: Run SQL queries
- API Docs: Auto-generated API documentation
- Authentication: Manage users and auth settings
- Storage: Browse and manage files

### 2.5 Setup Database Schema

**Option 1: Using Supabase Studio**
1. Open Studio at http://localhost:3000
2. Go to SQL Editor
3. Run the schema from [`docs/DATA_MODEL.md`](DATA_MODEL.md)

**Option 2: Using SQL File**
```bash
# Create schema file
cat > docker/volumes/db/init/schema.sql << 'EOF'
-- See DATA_MODEL.md for complete schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add more tables...
EOF

# Apply schema
docker exec -i supabase-db psql -U postgres -d postgres < docker/volumes/db/init/schema.sql
```

### 2.6 Setup Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-from-docker-env
EOF

# Start development server
npm run dev
```

### 2.7 Verify Installation

**Check Supabase Services:**
```bash
# Kong API Gateway
curl http://localhost:8000/health

# PostgREST
curl http://localhost:8000/rest/v1/

# Auth (GoTrue)
curl http://localhost:8000/auth/v1/health

# Storage
curl http://localhost:8000/storage/v1/status

# Studio
curl http://localhost:3000/api/health
```

**Test Database Connection:**
```bash
# Using psql
docker exec -it supabase-db psql -U postgres -d postgres

# Run test query
SELECT version();
```

**Test Frontend:**
```bash
# Open frontend
open http://localhost:5173  # or whatever port Vite uses
```

---

## 3. Detailed Setup

### 3.1 Database Configuration

#### 3.1.1 PostgreSQL Setup

**Using Docker:**
```bash
# Start PostgreSQL container
docker run -d \
  --name memoir-postgres \
  -e POSTGRES_PASSWORD=your-password \
  -e POSTGRES_DB=memoir_platform \
  -p 5432:5432 \
  -v memoir-postgres-data:/var/lib/postgresql/data \
  postgres:15
```

**Using Local Installation:**
```bash
# macOS (Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt-get install postgresql-15
sudo systemctl start postgresql

# Create database
createdb memoir_platform
```

#### 3.1.2 Database Schema

```bash
# Apply migrations
cd backend
alembic upgrade head

# Verify schema
psql memoir_platform -c "\dt"

# Expected tables:
# - users
# - projects
# - memory_fragments
# - voice_profiles
# - chapters
# - manuscripts
# - collaborations
# - media_files
# - quality_reports
```

#### 3.1.3 Database Indexes

```sql
-- Performance indexes (automatically created by migrations)
CREATE INDEX idx_memory_fragments_project_id ON memory_fragments(project_id);
CREATE INDEX idx_memory_fragments_narrator_id ON memory_fragments(narrator_id);
CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_status ON chapters(status);

-- Full-text search
CREATE INDEX idx_memory_fragments_content_fts 
ON memory_fragments USING GIN (to_tsvector('english', processed_content));
```

### 3.2 Redis Setup

**Using Docker:**
```bash
docker run -d \
  --name memoir-redis \
  -p 6379:6379 \
  redis:7-alpine
```

**Using Local Installation:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

**Verify:**
```bash
redis-cli ping
# Expected: PONG
```

### 3.3 Object Storage Setup

#### 3.3.1 Using AWS S3

```bash
# Install AWS CLI
pip install awscli

# Configure credentials
aws configure

# Create bucket
aws s3 mb s3://memoir-storage

# Set CORS policy
aws s3api put-bucket-cors --bucket memoir-storage --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

#### 3.3.2 Using Supabase Storage

```bash
# Already configured if using Supabase backend
# Create storage bucket via Supabase Studio or API

# Set bucket policy
supabase storage create-bucket memoir-storage --public
```

### 3.4 LLM API Setup

#### 3.4.1 OpenAI Setup

```bash
# Get API key from https://platform.openai.com/api-keys

# Add to .env
OPENAI_API_KEY=sk-your-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=2000
```

**Test Connection:**
```python
from openai import OpenAI

client = OpenAI(api_key="your-key")
response = client.chat.completions.create(
    model="gpt-4",
    messages=[{"role": "user", "content": "Test"}]
)
print(response.choices[0].message.content)
```

#### 3.4.2 Anthropic Setup

```bash
# Get API key from https://console.anthropic.com/

# Add to .env
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-3-opus-20240229
ANTHROPIC_MAX_TOKENS=2000
```

### 3.5 SMTP Configuration

#### 3.5.1 Gmail Setup

```bash
# Enable 2-factor authentication on Gmail
# Generate app-specific password

# Add to .env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

#### 3.5.2 SendGrid Setup

```bash
# Get API key from SendGrid dashboard

# Add to .env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

**Test Email:**
```python
import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Test email")
msg['Subject'] = "Test"
msg['From'] = "noreply@yourdomain.com"
msg['To'] = "test@example.com"

with smtplib.SMTP('smtp.gmail.com', 587) as server:
    server.starttls()
    server.login("your-email@gmail.com", "your-password")
    server.send_message(msg)
```

---

## 4. Development Environment

### 4.1 IDE Setup

#### 4.1.1 VS Code Configuration

**Recommended Extensions:**
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.vscode-pylance",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-azuretools.vscode-docker",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg"
  ]
}
```

**Settings:**
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

#### 4.1.2 Python Environment

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Setup pre-commit hooks
pre-commit install

# Run linters
black .
pylint app/
mypy app/
```

#### 4.1.3 Node.js Environment

```bash
# Install development dependencies
npm install --save-dev

# Setup ESLint and Prettier
npm run lint
npm run format
```

### 4.2 Database Tools

#### 4.2.1 pgAdmin Setup

```bash
# macOS
brew install --cask pgadmin4

# Ubuntu/Debian
sudo apt-get install pgadmin4
```

**Connection Settings:**
- Host: localhost
- Port: 5432
- Database: memoir_platform
- Username: postgres
- Password: your-password

#### 4.2.2 DBeaver Setup

```bash
# Download from https://dbeaver.io/download/

# Connect to PostgreSQL
# Use same connection settings as pgAdmin
```

### 4.3 API Testing

#### 4.3.1 Postman Setup

```bash
# Import API collection
# File: postman/Digital_Memoir_Platform.postman_collection.json

# Import environment
# File: postman/Local_Development.postman_environment.json
```

**Environment Variables:**
```json
{
  "api_url": "http://localhost:8000",
  "access_token": "{{access_token}}",
  "project_id": "{{project_id}}"
}
```

#### 4.3.2 cURL Examples

```bash
# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Create project
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"book_type":"individual_memoir","title":"My Life Story"}'
```

---

## 5. Docker Setup (Alternative)

### 5.1 Docker Compose

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: memoir_platform
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/memoir_platform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    command: npm run dev
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  worker:
    build: ./backend
    command: celery -A app.celery worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/memoir_platform
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres-data:
```

### 5.2 Start with Docker

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

---

## 6. Initial Data Setup

### 6.1 Create Admin User

```bash
# Using management command
python manage.py create-admin \
  --email admin@example.com \
  --password secure-password \
  --name "Admin User"

# OR using Python shell
python manage.py shell
```

```python
from app.models import User
from app.auth import hash_password

admin = User.create(
    email="admin@example.com",
    password_hash=hash_password("secure-password"),
    name="Admin User",
    role="admin"
)
```

### 6.2 Seed Test Data

```bash
# Run seed script
python manage.py seed --env development

# This creates:
# - 5 test users
# - 10 test projects
# - 50 memory fragments
# - 20 chapters
```

### 6.3 Load Sample Memoir

```bash
# Load sample memoir data
python manage.py load-sample-memoir \
  --file samples/sample_memoir.json \
  --user test@example.com
```

---

## 7. Verification & Testing

### 7.1 Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database connection
curl http://localhost:8000/health/db

# Redis connection
curl http://localhost:8000/health/redis

# LLM API connection
curl http://localhost:8000/health/llm
```

### 7.2 Run Test Suite

```bash
# Backend unit tests
cd backend
pytest tests/unit/

# Backend integration tests
pytest tests/integration/

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

### 7.3 Manual Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] Project creation works
- [ ] Voice calibration accepts samples
- [ ] Memory fragment upload works
- [ ] Chapter generation works
- [ ] Quality gates run successfully
- [ ] PDF generation works
- [ ] Email notifications send

---

## 8. Troubleshooting

### 8.1 Common Issues

**Issue: Database connection refused**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# OR
pg_isready -h localhost -p 5432

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Issue: LLM API errors**
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Issue: Frontend can't connect to backend**
```bash
# Check CORS settings in backend
# Verify API_URL in frontend .env
# Check if backend is running
curl http://localhost:8000/health
```

**Issue: Email not sending**
```bash
# Test SMTP connection
python -c "
import smtplib
server = smtplib.SMTP('$SMTP_HOST', $SMTP_PORT)
server.starttls()
server.login('$SMTP_USER', '$SMTP_PASS')
print('SMTP connection successful')
server.quit()
"
```

### 8.2 Reset Development Environment

```bash
# Stop all services
docker-compose down -v

# Remove database
dropdb memoir_platform
createdb memoir_platform

# Clear Redis
redis-cli FLUSHALL

# Reinstall dependencies
pip install -r requirements.txt
npm install

# Run migrations
alembic upgrade head

# Restart services
docker-compose up -d
```

---

## 9. Next Steps

### 9.1 Development Workflow

1. **Read Documentation:**
   - [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md) - Understand project scope
   - [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md) - Learn system design
   - [`API_SPECIFICATIONS.md`](API_SPECIFICATIONS.md) - API reference

2. **Explore Codebase:**
   - Backend: `backend/app/`
   - Frontend: `frontend/src/`
   - Database: `backend/alembic/versions/`

3. **Run Examples:**
   - Create test project
   - Upload memory fragments
   - Generate chapter
   - Run quality check

### 9.2 Contributing

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push and create pull request
git push origin feature/your-feature-name
```

### 9.3 Additional Resources

- **Documentation:** [`docs/INDEX.md`](INDEX.md)
- **API Reference:** [`docs/API_SPECIFICATIONS.md`](API_SPECIFICATIONS.md)
- **Deployment:** [`docs/PLATFORM_DEPLOYMENT.md`](PLATFORM_DEPLOYMENT.md)
- **Troubleshooting:** [`docs/PLATFORM_TROUBLESHOOTING.md`](PLATFORM_TROUBLESHOOTING.md)

---

## Document Authority

This setup guide is derived from and subordinate to:
1. [`Digital_Memoir_Platform_Concept_and_Scope.pdf`](Digital_Memoir_Platform_Concept_and_Scope.pdf)
2. [`PROJECT_SCOPE.md`](PROJECT_SCOPE.md)
3. [`SYSTEM_ARCHITECTURE.md`](SYSTEM_ARCHITECTURE.md)
4. [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md)

All setup procedures must support the print-first, quality-enforced, voice-preserved principles of the platform.

# Ghostwriter Workflow Deployment & Testing Guide

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Phase 1: Database Setup](#phase-1-database-setup)
4. [Phase 2: Backend Deployment](#phase-2-backend-deployment)
5. [Phase 3: Frontend Deployment](#phase-3-frontend-deployment)
6. [Testing Strategy](#testing-strategy)
7. [Verification Steps](#verification-steps)
8. [Rollback Procedures](#rollback-procedures)
9. [Monitoring & Observability](#monitoring--observability)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Post-Deployment Tasks](#post-deployment-tasks)
12. [Success Metrics](#success-metrics)
13. [Future Enhancements](#future-enhancements)
14. [Quick Reference](#quick-reference)

---

## Overview

This guide provides step-by-step instructions for deploying the complete Ghostwriter Workflow feature to production. The feature includes:

- ✅ **Database Schema**: 5 new tables + extensions to 2 existing tables
- ✅ **Backend API**: 4 Edge Functions with shared utilities
- ✅ **Frontend UI**: 13 components, 4 pages, state management, routing
- ✅ **Photo Intelligence**: GPT-4 Vision integration
- ✅ **Quality Scoring**: Automated quality assessment
- ✅ **Progressive Unlocking**: Section-based workflow

**Estimated Deployment Time:** 2-3 hours (including testing)

---

## Pre-Deployment Checklist

### Required Access & Credentials

- [ ] **Supabase Project Access**
  - Project URL and credentials
  - Admin/Owner role for database migrations
  - Access to Supabase CLI or Dashboard

- [ ] **OpenAI API Key**
  - Valid OpenAI API key with GPT-4 and GPT-4 Vision access
  - Sufficient API quota for expected usage
  - Billing configured and active

- [ ] **Environment Variables**
  - Production Supabase URL
  - Production Supabase Anon Key
  - Production Supabase Service Role Key
  - OpenAI API Key

- [ ] **Development Environment**
  - Docker installed and running (for local testing)
  - Supabase CLI installed (`npm install -g supabase`)
  - Node.js 18+ and npm installed
  - Git repository access

### Pre-Deployment Verification

- [ ] **Database Backup**
  - Create full database backup before migrations
  - Document backup location and timestamp
  - Test backup restoration process

- [ ] **Code Review**
  - All migrations reviewed and approved
  - Edge Functions tested locally
  - Frontend components tested in staging
  - No pending critical bugs

- [ ] **Documentation**
  - API documentation up to date
  - Component documentation complete
  - Migration scripts documented
  - Rollback procedures prepared

- [ ] **Stakeholder Communication**
  - Deployment window scheduled
  - Team notified of deployment
  - Support team briefed on new features
  - Users notified if downtime expected

---

## Phase 1: Database Setup

### Step 1.1: Backup Current Database

**Local Development:**
```bash
# Backup local database
cd docker
docker exec supabase-db pg_dump -U postgres -d postgres > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Production (via Supabase Dashboard):**
1. Navigate to Database → Backups
2. Click "Create Backup"
3. Wait for backup completion
4. Download backup file for safety

**Production (via CLI):**
```bash
# Connect to production database
supabase db dump --db-url "postgresql://postgres:[password]@[host]:5432/postgres" > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 1.2: Run Database Migrations

**Using the Migration Script (Recommended):**

```bash
# From project root
./scripts/run-ghostwriter-migrations.sh

# Check migration status
./scripts/run-ghostwriter-migrations.sh --status
```

**Manual Migration (if script fails):**

```bash
# Navigate to migrations directory
cd supabase/migrations/ghostwriter

# Apply migrations in order
for file in 001_*.sql 002_*.sql 003_*.sql 004_*.sql 005_*.sql 006_*.sql 007_*.sql 008_*.sql 009_*.sql; do
  echo "Applying $file..."
  docker exec -i supabase-db psql -U postgres -d postgres < "$file"
done
```

**Production Migration:**

```bash
# Using Supabase CLI
supabase db push

# Or apply migrations individually
supabase migration up
```

### Step 1.3: Verify Tables Created

```sql
-- Check for new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles', 
  'memoir_sections', 
  'section_prompts', 
  'section_synthesis'
)
ORDER BY table_name;

-- Expected output: 4 tables
```

### Step 1.4: Verify Table Extensions

```sql
-- Check memory_fragments extensions
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'memory_fragments'
AND column_name IN (
  'section_id', 
  'prompt_id', 
  'photo_id', 
  'ai_enhanced_content',
  'privacy_level', 
  'word_count', 
  'sensory_richness_score', 
  'emotional_depth_score'
)
ORDER BY column_name;

-- Expected output: 8 columns

-- Check media_files extensions
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'media_files'
AND column_name IN (
  'ai_analysis', 
  'user_context', 
  'narrative_usage', 
  'analyzed_at'
)
ORDER BY column_name;

-- Expected output: 4 columns
```

### Step 1.5: Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles', 
  'memoir_sections', 
  'section_prompts', 
  'section_synthesis'
);

-- All should show rowsecurity = true

-- Check policy count
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles', 
  'memoir_sections', 
  'section_prompts', 
  'section_synthesis'
)
GROUP BY schemaname, tablename;

-- Each table should have 2-4 policies
```

### Step 1.6: Verify Indexes Created

```sql
-- Check indexes on new tables
SELECT 
  tablename, 
  indexname, 
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
  'user_profiles', 
  'memoir_sections', 
  'section_prompts', 
  'section_synthesis',
  'memory_fragments',
  'media_files'
)
ORDER BY tablename, indexname;

-- Should see multiple indexes per table
```

### Step 1.7: Seed Initial Data (Optional)

```bash
# Run seed data migration
docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/ghostwriter/009_seed_data.sql
```

**Verify seed data:**
```sql
-- Check for default section prompts
SELECT section_key, COUNT(*) as prompt_count
FROM section_prompts
GROUP BY section_key;

-- Should see prompts for core sections
```

---

## Phase 2: Backend Deployment

### Step 2.1: Configure Environment Variables

**Local Development:**

```bash
# Create .env file in supabase/functions/
cd supabase/functions
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required Variables:**
```bash
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

**Optional Variables:**
```bash
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_VISION_MODEL=gpt-4-vision-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000
```

**Production (via Supabase CLI):**

```bash
# Set secrets in production
supabase secrets set OPENAI_API_KEY=your-openai-api-key-here
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Verify secrets are set
supabase secrets list
```

**Production (via Supabase Dashboard):**
1. Navigate to Project Settings → Edge Functions
2. Click "Manage Secrets"
3. Add each secret:
   - `OPENAI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Save changes

### Step 2.2: Test Edge Functions Locally

```bash
# Start Supabase locally
cd docker
docker-compose up -d

# Serve Edge Functions
cd ../supabase/functions
supabase functions serve --env-file .env

# In another terminal, test each function
# Get a test JWT token first
TOKEN="your-test-jwt-token"

# Test profile-management
curl -X POST http://localhost:9000/profile-management \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "test-uuid",
    "birth_year": 1980,
    "has_children": true,
    "marital_status": "married",
    "book_tone": "warm"
  }'

# Test section-management
curl "http://localhost:9000/section-management?projectId=test-uuid" \
  -H "Authorization: Bearer $TOKEN"

# Test photo-intelligence (with test image URL)
curl -X POST http://localhost:9000/photo-intelligence/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo_url": "https://example.com/test-photo.jpg",
    "project_id": "test-uuid",
    "photo_id": "test-photo-uuid"
  }'

# Test section-synthesis
curl -X POST http://localhost:9000/section-synthesis/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "test-section-uuid",
    "project_id": "test-uuid"
  }'
```

### Step 2.3: Deploy Edge Functions to Production

**Deploy All Functions:**
```bash
# Deploy all functions at once
supabase functions deploy

# Verify deployment
supabase functions list
```

**Deploy Individual Functions:**
```bash
# Deploy one at a time (safer for production)
supabase functions deploy profile-management
supabase functions deploy section-management
supabase functions deploy photo-intelligence
supabase functions deploy section-synthesis

# Check deployment status
supabase functions list
```

### Step 2.4: Test Production Endpoints

```bash
# Get production URL from Supabase dashboard
PROD_URL="https://your-project.supabase.co/functions/v1"

# Test profile-management
curl -X POST "$PROD_URL/profile-management" \
  -H "Authorization: Bearer $PROD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "real-project-uuid",
    "birth_year": 1980,
    "book_tone": "warm"
  }'

# Expected: 200 OK with profile data
```

### Step 2.5: Monitor Function Logs

```bash
# View logs for each function
supabase functions logs profile-management --tail
supabase functions logs section-management --tail
supabase functions logs photo-intelligence --tail
supabase functions logs section-synthesis --tail

# Or view all logs
supabase functions logs --tail
```

**Via Supabase Dashboard:**
1. Navigate to Edge Functions
2. Click on function name
3. View "Logs" tab
4. Monitor for errors

---

## Phase 3: Frontend Deployment

### Step 3.1: Update Frontend Environment Variables

**Create Production `.env` file:**

```bash
cd frontend
cp .env.example .env.production

# Edit with production values
nano .env.production
```

**Production Variables:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_NAME=Digital Memoir Platform
VITE_APP_VERSION=1.0.0
```

### Step 3.2: Test Frontend Locally

```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Open browser to http://localhost:5173
# Test the following flows:
# 1. Create new project
# 2. Complete profile setup
# 3. View section roadmap
# 4. Answer prompts
# 5. Upload photo
# 6. Generate synthesis
```

### Step 3.3: Build Frontend for Production

```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview

# Open browser to http://localhost:4173
# Test all critical paths again
```

### Step 3.4: Deploy Frontend

**Option A: Deploy to Existing Server**

```bash
# Build and copy to server
npm run build
scp -r dist/* user@server:/var/www/everbound/

# Or use deployment script
./scripts/deploy.sh
```

**Option B: Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

**Option C: Deploy to Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist

# Set environment variables in Netlify dashboard
```

### Step 3.5: Verify Frontend Routes

Test all new routes are accessible:

- [ ] `/ghostwriter/profile-setup/:projectId` - Profile setup wizard
- [ ] `/ghostwriter/roadmap/:projectId` - Section roadmap
- [ ] `/ghostwriter/section/:sectionId` - Prompt list
- [ ] `/ghostwriter/section/:sectionId/prompt/:promptId` - Individual prompt
- [ ] `/ghostwriter/synthesis/:sectionId` - Chapter preview

### Step 3.6: Test Frontend Integration

**Complete User Flow Test:**

1. **Create Project**
   - Navigate to project creation
   - Create new memoir project
   - Verify redirect to profile setup

2. **Profile Setup**
   - Complete questionnaire (Step 1)
   - Fill timeline anchors (Step 2)
   - Select book tone (Step 3)
   - Submit profile
   - Verify redirect to roadmap

3. **Section Roadmap**
   - Verify sections displayed
   - Check locked/unlocked states
   - Verify progress indicators
   - Click unlocked section

4. **Prompt Capture**
   - View prompt list
   - Click individual prompt
   - Write response (200+ words)
   - Save draft
   - Submit response
   - Verify progress updates

5. **Photo Upload**
   - Upload photo to prompt
   - Verify upload success
   - Check photo analysis (if enabled)
   - Verify photo appears in gallery

6. **Section Synthesis**
   - Complete required prompts
   - Navigate to synthesis
   - Generate chapter preview
   - Review quality feedback
   - Approve section
   - Verify next section unlocks

---

## Testing Strategy

### Unit Testing

#### Backend (Edge Functions)

**Test Shared Utilities:**

```typescript
// Test quality scoring
import { calculateQualityScores } from './_shared/quality-scoring.ts';

const testText = "The warm summer sun beat down on the sandy beach...";
const scores = calculateQualityScores(testText);

console.assert(scores.sensory_richness_score > 0.5, "Sensory score should be high");
console.assert(scores.emotional_depth_score >= 0, "Emotional score should be valid");
```

**Test Section Logic:**

```typescript
// Test unlock eligibility
import { checkUnlockEligibility } from './_shared/section-logic.ts';

const canUnlock = await checkUnlockEligibility(sectionId, projectId);
console.assert(typeof canUnlock === 'boolean', "Should return boolean");
```

**Test Database Queries:**

```typescript
// Test profile retrieval
import { getUserProfile } from './_shared/db.ts';

const profile = await getUserProfile(projectId);
console.assert(profile !== null, "Profile should exist");
console.assert(profile.project_id === projectId, "Project ID should match");
```

#### Frontend (Components)

**Test Component Rendering:**

```typescript
// Test ProfileQuestionnaire
import { render, screen } from '@testing-library/react';
import ProfileQuestionnaire from './ProfileQuestionnaire';

test('renders profile questionnaire', () => {
  render(<ProfileQuestionnaire onComplete={() => {}} />);
  expect(screen.getByText(/Relationship & Family/i)).toBeInTheDocument();
});
```

**Test State Management:**

```typescript
// Test ghostwriter store
import { useGhostwriterStore } from '../stores/ghostwriterStore';

test('updates profile state', () => {
  const { setProfile } = useGhostwriterStore.getState();
  setProfile({ birth_year: 1980 });
  
  const { profile } = useGhostwriterStore.getState();
  expect(profile.birth_year).toBe(1980);
});
```

### Integration Testing

#### Test Profile Setup Flow

```bash
# Test complete profile creation
curl -X POST "$API_URL/profile-management" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data/profile.json

# Verify sections initialized
curl "$API_URL/section-management?projectId=$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"

# Expected: 9-14 sections depending on profile
```

#### Test Section Unlocking Logic

```bash
# 1. Get initial sections (only first should be unlocked)
curl "$API_URL/section-management?projectId=$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN"

# 2. Add memories to first section
# (Add 5+ memories via memory_fragments table)

# 3. Check unlock eligibility
curl -X POST "$API_URL/section-management/check-eligibility" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "$FIRST_SECTION_ID",
    "project_id": "$PROJECT_ID"
  }'

# 4. Unlock next section
curl -X POST "$API_URL/section-management/unlock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_section_id": "$FIRST_SECTION_ID",
    "project_id": "$PROJECT_ID"
  }'

# Expected: Second section now unlocked
```

#### Test Photo Intelligence

```bash
# 1. Upload photo to Supabase Storage
# (Use Supabase client or dashboard)

# 2. Analyze photo
curl -X POST "$API_URL/photo-intelligence/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photo_url": "$PHOTO_URL",
    "project_id": "$PROJECT_ID",
    "photo_id": "$PHOTO_ID",
    "user_context": "Family beach day, summer 1975"
  }'

# Expected: Analysis with people, setting, objects, mood

# 3. Enhance memory with photo
curl -X POST "$API_URL/photo-intelligence/enhance-memory" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "original_text": "My mother was a kind woman",
    "photo_id": "$PHOTO_ID",
    "project_id": "$PROJECT_ID"
  }'

# Expected: Enhanced text with visual details
```

#### Test Section Synthesis

```bash
# 1. Add multiple memories to section
# (Add 5+ quality memories)

# 2. Generate synthesis
curl -X POST "$API_URL/section-synthesis/generate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "$SECTION_ID",
    "project_id": "$PROJECT_ID"
  }'

# Expected: Chapter preview with quality feedback

# 3. Get synthesis
curl "$API_URL/section-synthesis/preview?sectionId=$SECTION_ID" \
  -H "Authorization: Bearer $TOKEN"

# 4. Approve synthesis
curl -X POST "$API_URL/section-synthesis/approve" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "section_id": "$SECTION_ID",
    "project_id": "$PROJECT_ID",
    "user_feedback": "Looks great!"
  }'

# Expected: Section marked complete, next section unlocked
```

### End-to-End Testing

**Complete User Journey:**

1. **Setup** (5 minutes)
   - Create account
   - Verify email
   - Login
   - Create project

2. **Profile** (10 minutes)
   - Complete questionnaire
   - Fill timeline
   - Select tone
   - Submit profile

3. **First Section** (20 minutes)
   - View roadmap
   - Click first section
   - Answer 5 prompts
   - Upload 2 photos
   - Generate preview
   - Review feedback
   - Approve section

4. **Second Section** (15 minutes)
   - Verify unlock
   - Answer 3 prompts
   - Upload 1 photo
   - Generate preview
   - Approve section

5. **Verification** (5 minutes)
   - Check progress
   - View photo gallery
   - Review completed sections
   - Verify data persistence

**Expected Results:**
- All steps complete without errors
- Data persists across sessions
- Photos display correctly
- Quality scores calculated
- Sections unlock progressively
- Total time: ~55 minutes

### Performance Testing

#### Photo Analysis Response Times

```bash
# Test photo analysis speed
time curl -X POST "$API_URL/photo-intelligence/analyze" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @test-data/photo-request.json

# Target: < 15 seconds
```

#### Database Query Performance

```sql
-- Test section listing query
EXPLAIN ANALYZE
SELECT * FROM memoir_sections
WHERE project_id = 'test-uuid'
ORDER BY section_order;

-- Target: < 50ms

-- Test memory fragments query
EXPLAIN ANALYZE
SELECT * FROM memory_fragments
WHERE section_id = 'test-uuid'
AND privacy_level = 'included';

-- Target: < 100ms
```

#### Frontend Load Times

```bash
# Test page load performance
lighthouse http://localhost:5173/ghostwriter/roadmap/test-uuid \
  --output=json \
  --output-path=./lighthouse-report.json

# Targets:
# - First Contentful Paint: < 1.5s
# - Time to Interactive: < 3.0s
# - Speed Index: < 2.5s
```

#### Mobile Performance

```bash
# Test mobile performance
lighthouse http://localhost:5173/ghostwriter/roadmap/test-uuid \
  --preset=mobile \
  --output=json

# Targets:
# - Performance Score: > 90
# - Accessibility Score: > 95
# - Best Practices Score: > 90
```

---

## Verification Steps

### Post-Deployment Verification Checklist

#### Database Verification

- [ ] **Tables Exist**
  ```sql
  SELECT COUNT(*) FROM information_schema.tables 
  WHERE table_name IN ('user_profiles', 'memoir_sections', 'section_prompts', 'section_synthesis');
  -- Expected: 4
  ```

- [ ] **RLS Policies Active**
  ```sql
  SELECT tablename, COUNT(*) as policy_count
  FROM pg_policies
  WHERE tablename IN ('user_profiles', 'memoir_sections', 'section_prompts', 'section_synthesis')
  GROUP BY tablename;
  -- Expected: 2-4 policies per table
  ```

- [ ] **Indexes Created**
  ```sql
  SELECT COUNT(*) FROM pg_indexes
  WHERE tablename IN ('user_profiles', 'memoir_sections', 'section_prompts', 'section_synthesis');
  -- Expected: 15+ indexes
  ```

- [ ] **Seed Data Loaded** (if applicable)
  ```sql
  SELECT COUNT(*) FROM section_prompts;
  -- Expected: > 0 if seed data was loaded
  ```

#### Backend Verification

- [ ] **Edge Functions Deployed**
  ```bash
  supabase functions list
  # Expected: 4 functions listed
  ```

- [ ] **Environment Variables Set**
  ```bash
  supabase secrets list
  # Expected: OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY
  ```

- [ ] **Profile Management Works**
  ```bash
  curl -X POST "$API_URL/profile-management" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"project_id": "test", "birth_year": 1980}'
  # Expected: 200 OK
  ```

- [ ] **Section Management Works**
  ```bash
  curl "$API_URL/section-management?projectId=test" \
    -H "Authorization: Bearer $TOKEN"
  # Expected: 200 OK with sections array
  ```

- [ ] **Photo Intelligence Works**
  ```bash
  curl -X POST "$API_URL/photo-intelligence/analyze" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"photo_url": "test.jpg", "project_id": "test"}'
  # Expected: 200 OK with analysis
  ```

- [ ] **Section Synthesis Works**
  ```bash
  curl -X POST "$API_URL/section-synthesis/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"section_id": "test", "project_id": "test"}'
  # Expected: 200 OK with synthesis
  ```

#### Frontend Verification

- [ ] **Routes Accessible**
  - Visit `/ghostwriter/profile-setup/test` → Should load
  - Visit `/ghostwriter/roadmap/test` → Should load
  - Visit `/ghostwriter/section/test` → Should load
  - Visit `/ghostwriter/synthesis/test` → Should load

- [ ] **Profile Setup Works**
  - Complete questionnaire → Saves successfully
  - Fill timeline → Saves successfully
  - Select tone → Saves successfully
  - Submit → Redirects to roadmap

- [ ] **Section Unlocking Works**
  - First section unlocked by default
  - Other sections locked
  - Complete section → Next unlocks

- [ ] **Photo Upload Works**
  - Select photo → Uploads successfully
  - Photo displays in gallery
  - Photo analysis runs (if enabled)

- [ ] **Synthesis Works**
  - Generate preview → Creates chapter
  - Quality feedback displays
  - Approve → Marks section complete

- [ ] **Mobile Responsive**
  - Test on mobile device or emulator
  - All components display correctly
  - Touch targets are adequate (48px+)
  - No horizontal scrolling

#### Authentication & Authorization

- [ ] **Authentication Required**
  ```bash
  # Test without token
  curl "$API_URL/profile-management"
  # Expected: 401 Unauthorized
  ```

- [ ] **RLS Enforced**
  ```bash
  # Try to access another user's project
  curl "$API_URL/section-management?projectId=other-user-project" \
    -H "Authorization: Bearer $TOKEN"
  # Expected: 403 Forbidden or empty results
  ```

- [ ] **Project Access Verified**
  - User can only see their own projects
  - Collaborators have appropriate access
  - Service role has full access

---

## Rollback Procedures

### Database Rollback

#### Option 1: Restore from Backup

```bash
# Restore from backup file
docker exec -i supabase-db psql -U postgres -d postgres < backup_YYYYMMDD_HHMMSS.sql

# Or via Supabase Dashboard:
# 1. Navigate to Database → Backups
# 2. Select backup to restore
# 3. Click "Restore"
# 4. Confirm restoration
```

#### Option 2: Run Rollback Migrations

```bash
# Run rollback script
./scripts/run-ghostwriter-migrations.sh --rollback

# Or manually rollback migrations in reverse order
cd supabase/migrations/ghostwriter

# Rollback in reverse order
docker exec -i supabase-db psql -U postgres -d postgres < 009_rollback.sql
docker exec -i supabase-db psql -U postgres -d postgres < 008_rollback.sql
docker exec -i supabase-db psql -U postgres -d postgres < 007_rollback.sql
# ... continue for all migrations
```

#### Option 3: Manual Cleanup

```sql
-- Drop new tables
DROP TABLE IF EXISTS section_synthesis CASCADE;
DROP TABLE IF EXISTS section_prompts CASCADE;
DROP TABLE IF EXISTS memoir_sections CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Remove columns from memory_fragments
ALTER TABLE memory_fragments
DROP COLUMN IF EXISTS section_id,
DROP COLUMN IF EXISTS prompt_id,
DROP COLUMN IF EXISTS photo_id,
DROP COLUMN IF EXISTS ai_enhanced_content,
DROP COLUMN IF EXISTS privacy_level,
DROP COLUMN IF EXISTS word_count,
DROP COLUMN IF EXISTS sensory_richness_score,
DROP COLUMN IF EXISTS emotional_depth_score;

-- Remove columns from media_files
ALTER TABLE media_files
DROP COLUMN IF EXISTS ai_analysis,
DROP COLUMN IF EXISTS user_context,
DROP COLUMN IF EXISTS narrative_usage,
DROP COLUMN IF EXISTS analyzed_at;
```

### Backend Rollback

#### Undeploy Edge Functions

```bash
# Delete functions from production
supabase functions delete profile-management
supabase functions delete section-management
supabase functions delete photo-intelligence
supabase functions delete section-synthesis

# Verify deletion
supabase functions list
```

#### Remove Secrets

```bash
# Remove secrets (optional)
supabase secrets unset OPENAI_API_KEY

# Verify removal
supabase secrets list
```

### Frontend Rollback

#### Revert to Previous Version

```bash
# Git rollback
git revert HEAD
git push origin main

# Redeploy previous version
npm run build
# Deploy using your deployment method
```

#### Remove Routes

```typescript
// In App.tsx, comment out or remove ghostwriter routes
/*
<Route path="/ghostwriter/profile-setup/:projectId" element={<ProfileSetupPage />} />
<Route path="/ghostwriter/roadmap/:projectId" element={<SectionRoadmapPage />} />
<Route path="/ghostwriter/section/:sectionId" element={<PromptCapturePage />} />
<Route path="/ghostwriter/section/:sectionId/prompt/:promptId" element={<PromptCapturePage />} />
<Route path="/ghostwriter/synthesis/:sectionId" element={<SynthesisPreviewPage />} />
*/
```

### Data Recovery

If data was created during the deployment:

```sql
-- Export user profiles before rollback
COPY (SELECT * FROM user_profiles) TO '/tmp/user_profiles_backup.csv' CSV HEADER;

-- Export memoir sections
COPY (SELECT * FROM memoir_sections) TO '/tmp/memoir_sections_backup.csv' CSV HEADER;

-- Export section prompts
COPY (SELECT * FROM section_prompts) TO '/tmp/section_prompts_backup.csv' CSV HEADER;

-- After rollback, data can be imported to new tables if needed
```

---

## Monitoring & Observability

### Edge Function Monitoring

#### Real-Time Logs

```bash
# Monitor all functions
supabase functions logs --tail

# Monitor specific function
supabase functions logs profile-management --tail

# Filter by error level
supabase functions logs --tail | grep ERROR
```

#### Log Analysis

**Key Metrics to Monitor:**
- Request count per function
- Average response time
- Error rate (4xx, 5xx)
- OpenAI API call duration
- Database query performance

**Via Supabase Dashboard:**
1. Navigate to Edge Functions
2. Select function
3. View "Metrics" tab
4. Monitor:
   - Invocations per minute
   - Error rate
   - Average execution time
   - Memory usage

### Database Performance Monitoring

#### Query Performance

```sql
-- Monitor slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%memoir_sections%'
   OR query LIKE '%user_profiles%'
   OR query LIKE '%memory_fragments%'
ORDER BY mean_time DESC
LIMIT 10;
```

#### Table Statistics

```sql
-- Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN (
  'user_profiles',
  'memoir_sections',
  'section_prompts',
  'section_synthesis',
  'memory_fragments',
  'media_files'
)
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Index Usage

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename IN (
  'user_profiles',
  'memoir_sections',
  'section_prompts',
  'section_synthesis'
)
ORDER BY idx_scan DESC;
```

### User Completion Metrics

#### Profile Completion Rate

```sql
-- Calculate profile completion rate
SELECT
  COUNT(*) FILTER (WHERE profile_completed = true) * 100.0 / COUNT(*) as completion_rate,
  COUNT(*) as total_profiles,
  COUNT(*) FILTER (WHERE profile_completed = true) as completed_profiles
FROM user_profiles;

-- Target: > 80%
```

#### Section Completion Rate

```sql
-- Calculate section completion rate
SELECT
  COUNT(*) FILTER (WHERE is_completed = true) * 100.0 / COUNT(*) as completion_rate,
  COUNT(*) as total_sections,
  COUNT(*) FILTER (WHERE is_completed = true) as completed_sections
FROM memoir_sections;

-- Target: > 60%
```

#### Photo Upload Rate

```sql
-- Calculate photo upload rate per memory
SELECT
  COUNT(DISTINCT photo_id) * 100.0 / COUNT(*) as photo_rate,
  COUNT(*) as total_memories,
  COUNT(DISTINCT photo_id) as memories_with_photos
FROM memory_fragments
WHERE photo_id IS NOT NULL;

-- Target: > 50%
```

### Quality Score Distribution

```sql
-- Analyze quality scores
SELECT
  ROUND(sensory_richness_score, 1) as score_bucket,
  COUNT(*) as count,
  AVG(word_count) as avg_words
FROM memory_fragments
WHERE sensory_richness_score IS NOT NULL
GROUP BY ROUND(sensory_richness_score, 1)
ORDER BY score_bucket;

-- Target: Most scores > 0.4
```

### OpenAI API Usage

**Monitor via OpenAI Dashboard:**
1. Visit https://platform.openai.com/usage
2. Check daily usage
3. Monitor costs
4. Set up billing alerts

**Key Metrics:**
- Total API calls per day
- GPT-4 vs GPT-4 Vision usage
- Average tokens per request
- Daily cost
- Rate limit hits

### Error Tracking

#### Common Error Patterns

```bash
# Track authentication errors
supabase functions logs --tail | grep "401\|403"

# Track OpenAI errors
supabase functions logs --tail | grep "OpenAI"

# Track database errors
supabase functions logs --tail | grep "database\|postgres"
```

#### Error Rate Alerts

Set up alerts for:
- Error rate > 5% for any function
- OpenAI API failures > 10%
- Database connection failures
- Photo upload failures > 15%

---

## Troubleshooting Guide

### Common Issues & Solutions

#### Issue 1: Migration Fails

**Symptoms:**
- Migration script exits with error
- Tables not created
- Columns missing

**Diagnosis:**
```bash
# Check migration status
./scripts/run-ghostwriter-migrations.sh --status

# Check database logs
docker logs supabase-db --tail 100
```

**Solutions:**
1. **Rollback and retry:**
   ```bash
   ./scripts/run-ghostwriter-migrations.sh --rollback
   ./scripts/run-ghostwriter-migrations.sh
   ```

2. **Check for conflicts:**
   ```sql
   -- Check if tables already exist
   SELECT table_name FROM information_schema.tables
   WHERE table_name IN ('user_profiles', 'memoir_sections');
   ```

3. **Manual migration:**
   ```bash
   # Apply migrations one by one
   cd supabase/migrations/ghostwriter
   docker exec -i supabase-db psql -U postgres -d postgres < 001_create_user_profiles.sql
   ```

#### Issue 2: RLS Policy Conflicts

**Symptoms:**
- Users can't access their own data
- 403 Forbidden errors
- Empty results when data exists

**Diagnosis:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'user_profiles';

-- Test policy with specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM user_profiles WHERE user_id = 'user-uuid';
```

**Solutions:**
1. **Verify policies exist:**
   ```sql
   SELECT tablename, policyname, cmd, qual
   FROM pg_policies
   WHERE tablename IN ('user_profiles', 'memoir_sections');
   ```

2. **Recreate policies:**
   ```bash
   docker exec -i supabase-db psql -U postgres -d postgres < supabase/migrations/ghostwriter/008_rls_policies.sql
   ```

3. **Check service role access:**
   ```sql
   -- Service role should bypass RLS
   SET ROLE service_role;
   SELECT * FROM user_profiles;
   ```

#### Issue 3: OpenAI API Errors

**Symptoms:**
- Photo analysis fails
- Memory enhancement fails
- Synthesis generation fails
- "OpenAI API error" in logs

**Diagnosis:**
```bash
# Check function logs
supabase functions logs photo-intelligence --tail

# Test OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

**Solutions:**
1. **Verify API key:**
   ```bash
   supabase secrets list
   # Ensure OPENAI_API_KEY is set
   ```

2. **Check API quota:**
   - Visit OpenAI dashboard
   - Verify billing is active
   - Check rate limits

3. **Test with simpler request:**
   ```bash
   curl -X POST "$API_URL/photo-intelligence/analyze" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"photo_url": "simple-test.jpg", "project_id": "test"}'
   ```

4. **Increase timeout:**
   ```typescript
   // In openai.ts, increase timeout
   const response = await fetch(url, {
     ...options,
     signal: AbortSignal.timeout(30000) // 30 seconds
   });
   ```

#### Issue 4: Photo Upload Failures

**Symptoms:**
- Photos don't upload
- Upload progress stuck
- Photos not appearing in gallery

**Diagnosis:**
```bash
# Check Supabase Storage
supabase storage list

# Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'photos';
```

**Solutions:**
1. **Verify storage bucket exists:**
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'photos';
   ```

2. **Check storage policies:**
   ```sql
   -- Users should be able to upload to their own folder
   SELECT * FROM storage.policies
   WHERE bucket_id = 'photos'
   AND operation = 'INSERT';
   ```

3. **Test upload manually:**
   ```typescript
   const { data, error } = await supabase.storage
     .from('photos')
     .upload('test/test.jpg', file);
   ```

#### Issue 5: Section Won't Unlock

**Symptoms:**
- Next section remains locked
- Unlock button disabled
- "Not eligible to unlock" message

**Diagnosis:**
```sql
-- Check section status
SELECT
  section_key,
  is_completed,
  required_memories,
  collected_memories,
  quality_score
FROM memoir_sections
WHERE project_id = 'project-uuid'
ORDER BY section_order;

-- Check memory quality
SELECT
  COUNT(*) as memory_count,
  AVG(sensory_richness_score) as avg_sensory,
  AVG(emotional_depth_score) as avg_emotional
FROM memory_fragments
WHERE section_id = 'section-uuid';
```

**Solutions:**
1. **Check completion requirements:**
   - Required memories collected (default: 5)
   - Quality threshold met (default: 0.4)
   - Previous section completed

2. **Manually unlock (for testing):**
   ```sql
   UPDATE memoir_sections
   SET is_unlocked = true
   WHERE id = 'next-section-uuid';
   ```

3. **Adjust quality threshold:**
   ```sql
   -- Lower threshold temporarily
   UPDATE memoir_sections
   SET quality_score = 0.3
   WHERE id = 'section-uuid';
   ```

#### Issue 6: Synthesis Generation Fails

**Symptoms:**
- "Failed to generate preview" error
- Synthesis takes too long
- Empty preview content

**Diagnosis:**
```bash
# Check synthesis logs
supabase functions logs section-synthesis --tail

# Check memory fragments
SELECT COUNT(*), AVG(word_count)
FROM memory_fragments
WHERE section_id = 'section-uuid'
AND privacy_level = 'included';
```

**Solutions:**
1. **Ensure enough memories:**
   ```sql
   -- Need at least 3-5 quality memories
   SELECT COUNT(*) FROM memory_fragments
   WHERE section_id = 'section-uuid'
   AND word_count > 100;
   ```

2. **Check OpenAI token limits:**
   - Reduce max_tokens if hitting limits
   - Split synthesis into chunks

3. **Verify voice profile exists:**
   ```sql
   SELECT * FROM voice_profiles
   WHERE project_id = 'project-uuid';
   ```

#### Issue 7: Frontend Routes Not Working

**Symptoms:**
- 404 errors on ghostwriter routes
- Blank pages
- Routes not found

**Diagnosis:**
```bash
# Check build output
npm run build
# Look for route errors

# Check browser console
# Open DevTools → Console
```

**Solutions:**
1. **Verify routes in App.tsx:**
   ```typescript
   // Ensure routes are uncommented
   <Route path="/ghostwriter/profile-setup/:projectId" element={<ProfileSetupPage />} />
   ```

2. **Clear browser cache:**
   ```bash
   # Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

3. **Rebuild and redeploy:**
   ```bash
   cd frontend
   npm run build
   # Redeploy
   ```

#### Issue 8: Mobile Performance Issues

**Symptoms:**
- Slow page loads on mobile
- Laggy interactions
- High memory usage

**Diagnosis:**
```bash
# Run Lighthouse mobile audit
lighthouse https://your-site.com/ghostwriter/roadmap/test \
  --preset=mobile \
  --view
```

**Solutions:**
1. **Optimize images:**
   - Use WebP format
   - Implement lazy loading
   - Reduce image sizes

2. **Code splitting:**
   ```typescript
   // Lazy load components
   const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'));
   ```

3. **Reduce bundle size:**
   ```bash
   # Analyze bundle
   npm run build -- --analyze
   ```

---

## Post-Deployment Tasks

### Immediate Tasks (Day 1)

- [ ] **Monitor Error Rates**
  - Check Edge Function logs every hour
  - Monitor OpenAI API usage
  - Track database performance

- [ ] **Test Critical Paths**
  - Create test account
  - Complete full user journey
  - Verify all features work

- [ ] **Verify Metrics Collection**
  - Profile completion tracking
  - Section completion tracking
  - Photo upload tracking
  - Quality score calculation

- [ ] **Update Documentation**
  - Mark deployment as complete
  - Document any issues encountered
  - Update troubleshooting guide

### Short-Term Tasks (Week 1)

- [ ] **User Acceptance Testing**
  - Invite beta users
  - Collect feedback
  - Document pain points
  - Prioritize improvements

- [ ] **Performance Optimization**
  - Analyze slow queries
  - Optimize photo analysis
  - Improve synthesis speed
  - Reduce frontend bundle size

- [ ] **Monitor Success Metrics**
  - Track profile completion rate
  - Monitor section completion rate
  - Analyze photo upload rate
  - Review quality score distribution

- [ ] **Gather User Feedback**
  - Survey beta users
  - Conduct user interviews
  - Analyze usage patterns
  - Identify friction points

### Medium-Term Tasks (Month 1)

- [ ] **Feature Refinement**
  - Improve prompt quality
  - Enhance photo analysis
  - Refine quality scoring
  - Optimize unlocking logic

- [ ] **Performance Tuning**
  - Database query optimization
  - Edge Function optimization
  - Frontend performance improvements
  - Mobile experience enhancements

- [ ] **Documentation Updates**
  - User guides
  - Video tutorials
  - FAQ updates
  - Best practices guide

- [ ] **Analytics Implementation**
  - Set up analytics tracking
  - Create dashboards
  - Monitor conversion funnels
  - Track feature usage

---

## Success Metrics

### Target Metrics

#### User Engagement

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile Completion Rate | > 80% | % of users who complete profile setup |
| Section Completion Rate | > 60% | % of sections completed per project |
| Photo Upload Rate | > 50% | % of memories with associated photos |
| Time to First Chapter | < 7 days | Days from profile to first synthesis |
| User Retention (30-day) | > 70% | % of users active after 30 days |

#### Quality Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Average Quality Score | > 0.6 | Mean quality score across all memories |
| Sensory Richness | > 0.5 | Average sensory richness score |
| Emotional Depth | > 0.5 | Average emotional depth score |
| Memory Word Count | > 250 | Average words per memory |
| Synthesis Success Rate | > 90% | % of synthesis attempts that succeed |

#### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 500ms | Average response time for API calls |
| Photo Analysis Time | < 15s | Time to analyze photo with GPT-4 Vision |
| Synthesis Generation Time | < 30s | Time to generate chapter preview |
| Error Rate | < 2% | % of requests that result in errors |
| Uptime | > 99.5% | % of time system is available |

#### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Satisfaction | > 85% | % of users rating experience 4-5 stars |
| Feature Adoption | > 75% | % of users using ghostwriter workflow |
| Completion Rate | > 40% | % of projects that reach final chapter |
| Referral Rate | > 20% | % of users who refer others |
| Support Tickets | < 5% | % of users requiring support |

### Measurement Methods

#### SQL Queries for Metrics

```sql
-- Profile completion rate
SELECT
  COUNT(*) FILTER (WHERE profile_completed = true) * 100.0 / NULLIF(COUNT(*), 0) as rate
FROM user_profiles;

-- Section completion rate
SELECT
  COUNT(*) FILTER (WHERE is_completed = true) * 100.0 / NULLIF(COUNT(*), 0) as rate
FROM memoir_sections;

-- Average quality score
SELECT
  AVG(sensory_richness_score) as avg_sensory,
  AVG(emotional_depth_score) as avg_emotional,
  AVG((sensory_richness_score + emotional_depth_score) / 2) as avg_overall
FROM memory_fragments
WHERE sensory_richness_score IS NOT NULL;

-- Time to first chapter
SELECT
  AVG(EXTRACT(EPOCH FROM (ss.created_at - up.created_at)) / 86400) as avg_days
FROM section_synthesis ss
JOIN memoir_sections ms ON ss.section_id = ms.id
JOIN user_profiles up ON ms.project_id = up.project_id
WHERE ss.user_approved = true;
```

### Monitoring Dashboard

Create a dashboard to track:

1. **User Funnel**
   - Signups → Profile Complete → First Section → First Chapter

2. **Quality Trends**
   - Quality scores over time
   - Photo upload trends
   - Memory length trends

3. **Technical Health**
   - API response times
   - Error rates
   - OpenAI API usage

4. **User Satisfaction**
   - Feature ratings
   - Support tickets
   - User feedback

---

## Future Enhancements

### Phase 2: Voice-First Experience

**Priority:** High
**Timeline:** 2-3 months

- [ ] **Enhanced Voice Recording**
  - Larger, more prominent voice buttons
  - Visual waveform feedback during recording
  - Voice-to-text preview before saving
  - Edit transcription before submission

- [ ] **Voice-Driven Navigation**
  - Voice commands for navigation
  - "Read prompt aloud" feature
  - Voice feedback on progress

- [ ] **Voice Quality Analysis**
  - Detect emotion in voice recordings
  - Analyze speaking pace and tone
  - Provide feedback on storytelling quality

### Phase 3: Advanced Photo Features

**Priority:** Medium
**Timeline:** 3-4 months

- [ ] **Photo Timeline View**
  - Chronological photo display
  - Decade-based organization
  - Interactive timeline navigation

- [ ] **Automatic Photo Enhancement**
  - Color correction for old photos
  - Scratch and damage removal
  - Resolution upscaling

- [ ] **Batch Photo Upload**
  - Upload multiple photos at once
  - Bulk photo analysis
  - Automatic photo-to-section matching

- [ ] **Photo Relationship Detection**
  - Identify same people across photos
  - Detect photo series/sequences
  - Suggest related memories

### Phase 4: Collaboration Features

**Priority:** Medium
**Timeline:** 4-6 months

- [ ] **Family Member Invitation**
  - Invite family to contribute
  - Role-based permissions
  - Contribution tracking

- [ ] **Perspective Comparison**
  - Multiple perspectives on same event
  - Side-by-side memory comparison
  - Merged narrative generation

- [ ] **Collaborative Timeline**
  - Shared family timeline
  - Event verification
  - Photo sharing

- [ ] **Comment System**
  - Family members can comment
  - Ask clarifying questions
  - Add additional context

### Phase 5: Accessibility Enhancements

**Priority:** High
**Timeline:** 2-3 months

- [ ] **High Contrast Mode**
  - Toggle for high contrast
  - Larger text option
  - Simplified color palette

- [ ] **Font Size Adjustment**
  - User-controlled font sizing
  - Persistent preference
  - Responsive scaling

- [ ] **Text-to-Speech**
  - Read prompts aloud
  - Read chapter previews
  - Adjustable speech rate

- [ ] **Simplified Mode**
  - Even larger touch targets
  - Reduced visual complexity
  - One action per screen
  - Clearer instructions

### Phase 6: Export & Sharing

**Priority:** Medium
**Timeline:** 3-4 months

- [ ] **PDF Export**
  - Professional book layout
  - Photo placement
  - Table of contents
  - Print-ready format

- [ ] **Digital Sharing**
  - Shareable web links
  - Password protection
  - View-only access
  - Download options

- [ ] **Print Production**
  - Integration with print services
  - Book preview
  - Cover design options
  - Order tracking

### Phase 7: Analytics & Insights

**Priority:** Low
**Timeline:** 4-6 months

- [ ] **Personal Analytics**
  - Writing statistics
  - Progress visualization
  - Quality trends
  - Completion predictions

- [ ] **Memory Insights**
  - Common themes detected
  - Emotional arc visualization
  - Timeline gaps identified
  - Suggested prompts

- [ ] **Admin Dashboard**
  - Platform-wide metrics
  - User engagement trends
  - Feature usage analytics
  - Performance monitoring

---

## Quick Reference

### Essential Commands

```bash
# Database
./scripts/run-ghostwriter-migrations.sh              # Run migrations
./scripts/run-ghostwriter-migrations.sh --status     # Check status
./scripts/run-ghostwriter-migrations.sh --rollback   # Rollback

# Backend
supabase functions deploy                            # Deploy all functions
supabase functions deploy profile-management         # Deploy one function
supabase functions logs profile-management --tail    # View logs
supabase secrets set OPENAI_API_KEY=key             # Set secret
supabase secrets list                                # List secrets

# Frontend
cd frontend && npm run dev                           # Development server
cd frontend && npm run build                         # Production build
cd frontend && npm run preview                       # Preview build

# Testing
curl "$API_URL/profile-management" \                 # Test API
  -H "Authorization: Bearer $TOKEN"
lighthouse https://your-site.com --view             # Performance test
```

### Important URLs

- **Supabase Dashboard:** https://app.supabase.com
- **OpenAI Dashboard:** https://platform.openai.com
- **Production API:** https://your-project.supabase.co/functions/v1
- **Frontend:** https://your-domain.com

### Key Files

- **Migrations:** [`supabase/migrations/ghostwriter/`](../supabase/migrations/ghostwriter/)
- **Edge Functions:** [`supabase/functions/`](../supabase/functions/)
- **Frontend Components:** [`frontend/src/components/ghostwriter/`](../frontend/src/components/ghostwriter/)
- **API Client:** [`frontend/src/lib/api/ghostwriter.ts`](../frontend/src/lib/api/ghostwriter.ts)
- **Migration Script:** [`scripts/run-ghostwriter-migrations.sh`](../scripts/run-ghostwriter-migrations.sh)

### Support Contacts

- **Technical Issues:** [Your support email]
- **OpenAI Support:** https://help.openai.com
- **Supabase Support:** https://supabase.com/support

---

## Deployment Timeline

### Estimated Timeline: 2-3 Hours

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Preparation** | 15 min | Backup database, verify credentials, review checklist |
| **Database Setup** | 30 min | Run migrations, verify tables, check RLS policies |
| **Backend Deployment** | 30 min | Set secrets, deploy functions, test endpoints |
| **Frontend Deployment** | 30 min | Build, deploy, verify routes |
| **Testing** | 30 min | End-to-end testing, verification checklist |
| **Monitoring** | 15 min | Set up monitoring, check metrics |

### Detailed Timeline

**Hour 1: Database & Backend**
- 0:00-0:15: Pre-deployment preparation
- 0:15-0:45: Database migrations and verification
- 0:45-1:00: Backend environment setup
- 1:00-1:15: Edge Function deployment

**Hour 2: Frontend & Testing**
- 1:15-1:30: Frontend build and deployment
- 1:30-2:00: Integration testing
- 2:00-2:30: End-to-end user journey test
- 2:30-2:45: Verification checklist

**Hour 3: Monitoring & Documentation**
- 2:45-3:00: Set up monitoring and alerts
- 3:00-3:15: Final verification and documentation

---

## Conclusion

This deployment guide provides comprehensive instructions for deploying the Ghostwriter Workflow feature to production. The feature transforms memoir creation from an open-ended process into a structured, intelligent interview experience.

### Key Takeaways

1. **Backup First:** Always create database backups before migrations
2. **Test Locally:** Verify everything works locally before production deployment
3. **Deploy Incrementally:** Deploy database → backend → frontend in sequence
4. **Monitor Closely:** Watch logs and metrics closely after deployment
5. **Have Rollback Ready:** Be prepared to rollback if issues occur

### Success Criteria

Deployment is successful when:
- ✅ All database tables and indexes created
- ✅ RLS policies active and enforced
- ✅ All 4 Edge Functions deployed and responding
- ✅ Frontend routes accessible and functional
- ✅ Complete user journey works end-to-end
- ✅ Metrics collection operational
- ✅ No critical errors in logs

### Next Steps

After successful deployment:
1. Monitor metrics for first 24 hours
2. Conduct user acceptance testing
3. Gather feedback and iterate
4. Plan Phase 2 enhancements

---

**Document Version:** 1.0
**Last Updated:** December 19, 2024
**Maintained By:** Development Team

For questions or issues, refer to the [Troubleshooting Guide](#troubleshooting-guide) or contact the development team.
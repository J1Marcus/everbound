# Digital Memoir Platform - Supabase Architecture

**Version:** 2.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document defines the Supabase-based system architecture for the Digital Memoir Platform, ensuring all technical decisions align with the product vision of creating print-ready, high-quality narrative books from memory fragments using a modern, database-first approach.

---

## 1. Architecture Overview

### 1.1 Core Architecture Principles

1. **Database-First Design:** Supabase PostgreSQL as the single source of truth
2. **Print-First Focus:** All components optimize for print-ready output
3. **Quality Gates:** System enforces quality at every stage
4. **Voice Preservation:** Architecture supports consistent voice across sessions
5. **Serverless Logic:** Edge Functions for business logic and AI integration
6. **Real-time Collaboration:** Built-in subscriptions for multi-user workflows

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Application Layer                    │
│              (React/Vue + Supabase Client)                       │
│         Deployed on Vercel/Cloudflare Pages                      │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                  Self-Hosted Supabase Stack                      │
│                    (Docker Compose)                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Kong API Gateway (:8000)                      │ │
│  │         (Routing, Rate Limiting, CORS)                     │ │
│  └──┬──────────────┬──────────────┬──────────────┬───────────┘ │
│     │              │              │              │              │
│  ┌──▼────┐  ┌─────▼─────┐  ┌────▼─────┐  ┌────▼──────┐      │
│  │GoTrue │  │ PostgREST │  │ Storage  │  │  Realtime │      │
│  │ Auth  │  │    API    │  │   API    │  │  Server   │      │
│  │:9999  │  │   :3000   │  │  :5000   │  │   :4000   │      │
│  └──┬────┘  └─────┬─────┘  └────┬─────┘  └────┬──────┘      │
│     │             │              │              │              │
│  ┌──▼─────────────▼──────────────▼──────────────▼───────────┐ │
│  │              PostgreSQL Database (:5432)                  │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ Tables: users, projects, memory_fragments,       │    │ │
│  │  │         voice_profiles, chapters, manuscripts    │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ RLS Policies: Row-level security for all tables  │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  │  ┌──────────────────────────────────────────────────┐    │ │
│  │  │ Functions: Business logic, triggers, validation  │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         Edge Functions (Deno Runtime) (:9000)              │ │
│  │  ┌──────────────────────────────────────────────────┐     │ │
│  │  │ • process-memory-fragment                        │     │ │
│  │  │ • calibrate-voice                                │     │ │
│  │  │ • assemble-chapter                               │     │ │
│  │  │ • run-quality-checks                             │     │ │
│  │  │ • generate-narrative                             │     │ │
│  │  │ • generate-print-pdf                             │     │ │
│  │  └──────────────────────────────────────────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Supabase Studio (:3000)                          │ │
│  │         (Database Management UI)                           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────┬────────────────────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │   External APIs    │
                │  • OpenAI/Claude   │
                │  • Whisper STT     │
                │  • Print Services  │
                └────────────────────┘
```

---

## 2. Core Components

### 2.1 Supabase Services

#### PostgreSQL Database
- **Purpose:** Primary data store with built-in features
- **Version:** PostgreSQL 15+ (via supabase/postgres image)
- **Key Features:**
  - Row-Level Security (RLS) for authorization
  - Database functions for business logic
  - Triggers for automated workflows
  - Full-text search capabilities
  - JSONB for flexible metadata storage
  - Extensions: uuid-ossp, pgcrypto, pgjwt, pg_net

**Schema Organization:**
```sql
-- Core tables
public.users                 -- User accounts
public.projects              -- Memoir projects
public.memory_fragments      -- Raw memory inputs
public.voice_profiles        -- Voice characteristics
public.chapters              -- Assembled chapters
public.manuscripts           -- Complete manuscripts
public.collaborations        -- Project collaborators
public.media_files           -- Photos and audio

-- Auth tables (managed by GoTrue)
auth.users                   -- Authentication data
auth.sessions                -- User sessions
```

#### Kong API Gateway
- **Purpose:** Central routing and request management
- **Port:** 8000 (HTTP), 8443 (HTTPS)
- **Configuration:** [`docker/volumes/api/kong.yml`](../docker/volumes/api/kong.yml)
- **Features:**
  - Routes requests to appropriate services
  - JWT validation
  - Rate limiting
  - CORS handling
  - Request/response transformation

#### GoTrue (Authentication Service)
- **Purpose:** User authentication and session management
- **Port:** 9999 (internal)
- **Features:**
  - Email/password authentication
  - Magic link authentication
  - OAuth providers (Google, GitHub, etc.)
  - JWT token generation and validation
  - User metadata management
  - Email confirmation workflows

**Authentication Flow:**
```
1. User submits credentials → GoTrue
2. GoTrue validates → PostgreSQL auth.users
3. GoTrue generates JWT with user claims
4. JWT includes user_id, role, metadata
5. Frontend stores JWT in localStorage/cookie
6. All API requests include JWT in Authorization header
7. PostgREST validates JWT and enforces RLS
```

#### PostgREST (Auto-Generated REST API)
- **Purpose:** Automatic REST API from database schema
- **Port:** 3000 (internal)
- **Features:**
  - Auto-generated CRUD endpoints for all tables
  - Filtering, sorting, pagination
  - Relationship traversal (joins)
  - RLS policy enforcement
  - OpenAPI documentation

**API Patterns:**
```javascript
// Get all memory fragments for a project
GET /memory_fragments?project_id=eq.{id}&select=*

// Create new memory fragment
POST /memory_fragments
Body: { project_id, narrator_id, content, metadata }

// Update chapter with RLS enforcement
PATCH /chapters?id=eq.{id}
Body: { content, status }

// Complex query with joins
GET /projects?id=eq.{id}&select=*,chapters(*,memory_fragments(*))
```

#### Realtime Server
- **Purpose:** WebSocket connections for live updates
- **Port:** 4000 (internal)
- **Features:**
  - Database change subscriptions
  - Broadcast channels for collaboration
  - Presence tracking
  - Real-time notifications

**Use Cases:**
- Live collaboration feedback
- Chapter assembly progress updates
- Quality check notifications
- Multi-user editing awareness

#### Storage API
- **Purpose:** File storage and management
- **Port:** 5000 (internal)
- **Backend:** File system (configurable to S3)
- **Features:**
  - Photo upload/download
  - Audio file storage
  - Image transformations (resize, crop)
  - Access control policies
  - Signed URLs for secure access

**Storage Buckets:**
```
memoir-photos/          -- User-uploaded photos
  {project_id}/
    {fragment_id}/
      original.jpg
      thumbnail.jpg

memoir-audio/           -- Voice recordings
  {project_id}/
    {fragment_id}/
      recording.mp3

memoir-manuscripts/     -- Generated PDFs
  {project_id}/
    draft-v1.pdf
    final.pdf
```

#### Edge Functions (Deno Runtime)
- **Purpose:** Serverless functions for business logic
- **Port:** 9000 (internal)
- **Runtime:** Deno (TypeScript/JavaScript)
- **Location:** [`docker/volumes/functions/`](../docker/volumes/functions/)

**Key Functions:**

1. **process-memory-fragment**
   - Validates input
   - Calls tagging engine
   - Extracts timeline information
   - Analyzes emotional tone
   - Updates database

2. **calibrate-voice**
   - Processes writing samples
   - Calls LLM for voice analysis
   - Extracts characteristics
   - Creates voice profile
   - Stores constraints

3. **assemble-chapter**
   - Checks fragment readiness
   - Calls narrative generation LLM
   - Applies voice constraints
   - Validates structure
   - Stores chapter draft

4. **run-quality-checks**
   - Repetition detection
   - Timeline coherence
   - Emotional balance
   - Filler language detection
   - Generates quality report

5. **generate-narrative**
   - Assembles fragments
   - Calls LLM with voice profile
   - Generates connective prose
   - Maintains factual accuracy
   - Returns structured content

6. **generate-print-pdf**
   - Applies print layout
   - Validates photo resolution
   - Generates PDF/X-1a
   - Stores in storage bucket
   - Returns download URL

#### Supabase Studio
- **Purpose:** Web-based database management
- **Port:** 3000 (external in dev)
- **Features:**
  - Table editor with GUI
  - SQL editor
  - API documentation viewer
  - Authentication management
  - Storage browser
  - Real-time logs

---

## 3. Data Flow Patterns

### 3.1 Memory Capture Flow

```
┌─────────────┐
│   Frontend  │
│  User Input │
└──────┬──────┘
       │ 1. POST /memory_fragments
       │    (via Supabase client)
       ▼
┌──────────────┐
│  PostgREST   │ 2. Validate JWT
│              │ 3. Check RLS policies
└──────┬───────┘
       │ 4. INSERT into memory_fragments
       ▼
┌──────────────┐
│  PostgreSQL  │ 5. Store fragment
│              │ 6. Trigger: on_fragment_insert
└──────┬───────┘
       │ 7. Call Edge Function
       ▼
┌──────────────────┐
│  Edge Function   │ 8. Process fragment
│  process-memory  │ 9. Call tagging API
│   -fragment      │ 10. Extract timeline
└──────┬───────────┘
       │ 11. Update fragment with tags
       ▼
┌──────────────┐
│  PostgreSQL  │ 12. Store processed data
│              │ 13. Notify via Realtime
└──────┬───────┘
       │ 14. Real-time update
       ▼
┌─────────────┐
│  Frontend   │ 15. Display tagged fragment
└─────────────┘
```

### 3.2 Voice Calibration Flow

```
Frontend → Upload sample → Storage API → Store file
                                ↓
                         Edge Function: calibrate-voice
                                ↓
                         Call LLM API (OpenAI/Claude)
                                ↓
                         Extract characteristics
                                ↓
                         PostgreSQL: voice_profiles
                                ↓
                         Realtime notification
                                ↓
                         Frontend: Show profile
```

### 3.3 Chapter Assembly Flow

```
Frontend → Request assembly → Edge Function: assemble-chapter
                                      ↓
                              Check fragment count (SQL query)
                                      ↓
                              Retrieve fragments + voice profile
                                      ↓
                              Call LLM with constraints
                                      ↓
                              Generate narrative prose
                                      ↓
                              Edge Function: run-quality-checks
                                      ↓
                              Store chapter draft
                                      ↓
                              Realtime notification
                                      ↓
                              Frontend: Display chapter
```

### 3.4 Collaboration Flow

```
User A edits → PostgREST → PostgreSQL → Realtime broadcast
                                              ↓
                                         User B receives update
                                              ↓
                                         Frontend updates UI
```

---

## 4. Security Architecture

### 4.1 Row-Level Security (RLS)

**Core Principle:** Every table has RLS policies that enforce access control at the database level.

**Example Policies:**

```sql
-- Users can only view their own projects
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = owner_id);

-- Users can view projects they collaborate on
CREATE POLICY "Users can view collaborated projects"
ON projects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = projects.id
    AND user_id = auth.uid()
  )
);

-- Only project owners can delete projects
CREATE POLICY "Only owners can delete projects"
ON projects FOR DELETE
USING (auth.uid() = owner_id);

-- Collaborators can insert memory fragments
CREATE POLICY "Collaborators can add fragments"
ON memory_fragments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_collaborators
    WHERE project_id = memory_fragments.project_id
    AND user_id = auth.uid()
    AND role IN ('narrator', 'contributor')
  )
);
```

### 4.2 Authentication Security

**JWT Configuration:**
```bash
JWT_SECRET=<256-bit-secret>
JWT_EXPIRY=3600  # 1 hour
```

**Token Structure:**
```json
{
  "sub": "user-uuid",
  "role": "authenticated",
  "email": "user@example.com",
  "app_metadata": {
    "provider": "email"
  },
  "user_metadata": {
    "name": "John Doe"
  },
  "aud": "authenticated",
  "exp": 1234567890
}
```

**Security Features:**
- HttpOnly cookies (production)
- Secure flag for HTTPS
- SameSite=Strict
- Token refresh mechanism
- Automatic token expiration

### 4.3 API Security

**Rate Limiting (Kong):**
```yaml
# kong.yml
plugins:
  - name: rate-limiting
    config:
      minute: 60
      hour: 1000
      policy: local
```

**CORS Configuration:**
```yaml
# kong.yml
plugins:
  - name: cors
    config:
      origins:
        - https://yourdomain.com
        - http://localhost:3000
      methods:
        - GET
        - POST
        - PATCH
        - DELETE
      headers:
        - Authorization
        - Content-Type
```

### 4.4 Storage Security

**Bucket Policies:**
```sql
-- Only authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Users can only access their project files
CREATE POLICY "Users can access own project files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'memoir-photos'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM projects
    WHERE owner_id = auth.uid()
  )
);
```

---

## 5. Edge Functions Architecture

### 5.1 Function Structure

**Directory Layout:**
```
docker/volumes/functions/
├── process-memory-fragment/
│   ├── index.ts
│   └── types.ts
├── calibrate-voice/
│   ├── index.ts
│   └── voice-analyzer.ts
├── assemble-chapter/
│   ├── index.ts
│   └── narrative-generator.ts
├── run-quality-checks/
│   ├── index.ts
│   └── quality-analyzers.ts
├── generate-narrative/
│   ├── index.ts
│   └── llm-client.ts
└── generate-print-pdf/
    ├── index.ts
    └── pdf-generator.ts
```

### 5.2 Function Template

```typescript
// index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    // 1. Validate request
    const { method } = req
    if (method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // 2. Parse body
    const body = await req.json()
    
    // 3. Validate JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 4. Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // 5. Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // 6. Business logic here
    const result = await processLogic(body, supabase, user)

    // 7. Return response
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
```

### 5.3 LLM Integration Pattern

```typescript
// llm-client.ts
export async function callLLM(prompt: string, options: LLMOptions) {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: options.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2000,
    }),
  })

  const data = await response.json()
  return data.choices[0].message.content
}
```

---

## 6. Database Functions

### 6.1 Business Logic Functions

```sql
-- Check if chapter is ready for assembly
CREATE OR REPLACE FUNCTION check_chapter_readiness(chapter_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  fragment_count INTEGER;
  min_required INTEGER := 5;
BEGIN
  SELECT COUNT(*)
  INTO fragment_count
  FROM memory_fragments
  WHERE chapter_id = chapter_uuid
  AND status = 'validated';
  
  RETURN fragment_count >= min_required;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get voice profile for narrator
CREATE OR REPLACE FUNCTION get_voice_profile(narrator_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  profile JSONB;
BEGIN
  SELECT characteristics
  INTO profile
  FROM voice_profiles
  WHERE narrator_id = narrator_uuid
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6.2 Trigger Functions

```sql
-- Automatically process new memory fragments
CREATE OR REPLACE FUNCTION trigger_fragment_processing()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function asynchronously via pg_net
  PERFORM net.http_post(
    url := 'http://functions:9000/process-memory-fragment',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.jwt.claim.sub', true)
    ),
    body := jsonb_build_object(
      'fragment_id', NEW.id,
      'project_id', NEW.project_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_fragment_insert
AFTER INSERT ON memory_fragments
FOR EACH ROW
EXECUTE FUNCTION trigger_fragment_processing();
```

---

## 7. Frontend Integration

### 7.1 Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 7.2 Authentication

```typescript
// auth.ts
import { supabase } from './supabase'

// Sign up
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  return { data, error }
}

// Sign in
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### 7.3 Data Operations

```typescript
// api/projects.ts
import { supabase } from '../lib/supabase'

// Create project
export async function createProject(title: string, bookType: string) {
  const { data, error } = await supabase
    .from('projects')
    .insert({ title, book_type: bookType })
    .select()
    .single()
  
  return { data, error }
}

// Get user projects
export async function getUserProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      chapters (
        id,
        title,
        status,
        word_count
      )
    `)
    .order('created_at', { ascending: false })
  
  return { data, error }
}

// Create memory fragment
export async function createMemoryFragment(
  projectId: string,
  content: string,
  metadata: any
) {
  const { data, error } = await supabase
    .from('memory_fragments')
    .insert({
      project_id: projectId,
      raw_content: content,
      metadata
    })
    .select()
    .single()
  
  return { data, error }
}
```

### 7.4 Real-time Subscriptions

```typescript
// hooks/useRealtimeChapter.ts
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeChapter(chapterId: string) {
  const [chapter, setChapter] = useState(null)

  useEffect(() => {
    // Initial fetch
    supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single()
      .then(({ data }) => setChapter(data))

    // Subscribe to changes
    const subscription = supabase
      .channel(`chapter:${chapterId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapters',
          filter: `id=eq.${chapterId}`
        },
        (payload) => {
          setChapter(payload.new)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [chapterId])

  return chapter
}
```

### 7.5 Edge Function Calls

```typescript
// api/edgeFunctions.ts
import { supabase } from '../lib/supabase'

// Call Edge Function
export async function assembleChapter(chapterId: string) {
  const { data, error } = await supabase.functions.invoke('assemble-chapter', {
    body: { chapter_id: chapterId }
  })
  
  return { data, error }
}

// Run quality checks
export async function runQualityChecks(manuscriptId: string) {
  const { data, error } = await supabase.functions.invoke('run-quality-checks', {
    body: { manuscript_id: manuscriptId }
  })
  
  return { data, error }
}

// Generate PDF
export async function generatePDF(manuscriptId: string, specs: any) {
  const { data, error } = await supabase.functions.invoke('generate-print-pdf', {
    body: { 
      manuscript_id: manuscriptId,
      print_specs: specs
    }
  })
  
  return { data, error }
}
```

### 7.6 File Upload

```typescript
// api/storage.ts
import { supabase } from '../lib/supabase'

// Upload photo
export async function uploadPhoto(
  projectId: string,
  fragmentId: string,
  file: File
) {
  const filePath = `${projectId}/${fragmentId}/${file.name}`
  
  const { data, error } = await supabase.storage
    .from('memoir-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) return { data: null, error }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('memoir-photos')
    .getPublicUrl(filePath)
  
  return { data: { path: filePath, url: publicUrl }, error: null }
}

// Upload audio
export async function uploadAudio(
  projectId: string,
  fragmentId: string,
  file: File
) {
  const filePath = `${projectId}/${fragmentId}/${file.name}`
  
  const { data, error } = await supabase.storage
    .from('memoir-audio')
    .upload(filePath, file)
  
  return { data, error }
}
```

---

## 8. Deployment Architecture

### 8.1 Infrastructure

**Current Setup:**
- Self-hosted Supabase via Docker Compose
- Configuration: [`docker/docker-compose.yml`](../docker/docker-compose.yml)
- Deployment script: [`scripts/deploy.sh`](../scripts/deploy.sh)

**Components:**
```yaml
services:
  db:          # PostgreSQL
  kong:        # API Gateway
  auth:        # GoTrue
  rest:        # PostgREST
  realtime:    # Realtime Server
  storage:     # Storage API
  functions:   # Edge Functions
  studio:      # Supabase Studio
  analytics:   # Logflare
  vector:      # Log aggregation
```

### 8.2 Environment Configuration

**Development:**
```bash
ENVIRONMENT=development
SUPABASE_PUBLIC_URL=http://localhost:8000
API_EXTERNAL_URL=http://localhost:8000
SITE_URL=http://localhost:3000
```

**Production:**
```bash
ENVIRONMENT=production
SUPABASE_PUBLIC_URL=https://api.yourdomain.com
API_EXTERNAL_URL=https://api.yourdomain.com
SITE_URL=https://yourdomain.com
```

### 8.3 Deployment Process

```bash
# 1. Update code
git pull origin main

# 2. Update environment
nano docker/.env

# 3. Deploy backend
cd docker
docker-compose pull
docker-compose up -d

# 4. Run migrations (if any)
docker exec supabase-db psql -U postgres -d postgres -f /migrations/latest.sql

# 5. Deploy frontend
cd frontend
npm run build
vercel --prod

# 6. Verify deployment
./scripts/health-check.sh
```

---

## 9. Monitoring & Observability

### 9.1 Health Checks

```bash
# Database
docker exec supabase-db pg_isready -U postgres

# API Gateway
curl http://localhost:8000/health

# PostgREST
curl http://localhost:3000/

# Storage
curl http://localhost:5000/status

# Edge Functions
curl http://localhost:9000/health
```

### 9.2 Logging

**Supabase Analytics:**
- All API requests logged
- Query performance metrics
- Error tracking
- User activity

**Docker Logs:**
```bash
# View all logs
docker-compose logs -f

# Specific service
docker-compose logs -f rest

# Search for errors
docker-compose logs | grep ERROR
```

### 9.3 Metrics

**Key
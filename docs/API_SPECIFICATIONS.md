# Digital Memoir Platform - API Specifications (Legacy)

**Version:** 1.0
**Last Updated:** 2025-12-19
**Status:** Reference Only - See SUPABASE_ARCHITECTURE.md

> **⚠️ IMPORTANT:** This document describes a custom REST API that is **NOT** being used for this project.
>
> **For the actual API implementation, see:** [`SUPABASE_ARCHITECTURE.md`](SUPABASE_ARCHITECTURE.md)
>
> This project uses **Supabase** which provides:
> - **PostgREST**: Auto-generated REST API from database schema
> - **Edge Functions**: Serverless functions for business logic (see sections 5 & 7 in SUPABASE_ARCHITECTURE.md)
> - **Supabase Client**: Direct database queries with RLS enforcement
>
> **Key Differences:**
> - Database tables are accessed directly via PostgREST (e.g., `GET /memory_fragments?project_id=eq.{id}`)
> - Complex operations use Edge Functions (e.g., `POST /functions/v1/assemble-chapter`)
> - Authentication via GoTrue (built into Supabase)
> - Real-time subscriptions via Supabase Realtime
>
> This document is kept for reference to understand the API requirements and business logic, which are implemented using PostgREST queries and Edge Functions.

## Document Purpose

This document defines conceptual API specifications for the Digital Memoir Platform. The actual implementation uses Supabase PostgREST and Edge Functions - see [`SUPABASE_ARCHITECTURE.md`](SUPABASE_ARCHITECTURE.md) for the authoritative API documentation.

---

## 1. API Overview

### 1.1 API Design Principles

1. **RESTful Architecture:** Resource-based URLs, standard HTTP methods
2. **JSON Format:** All requests and responses use JSON
3. **Authentication Required:** All endpoints require authentication except public endpoints
4. **Idempotency:** PUT and DELETE operations are idempotent
5. **Rate Limiting:** Protect against abuse and ensure fair usage
6. **Versioning:** API version in URL path (`/api/v1/`)

### 1.2 Base URL

```
Production: https://api.memoirs.com/v1
Staging: https://staging-api.memoirs.com/v1
Development: http://localhost:8000/v1
```

### 1.3 Authentication

**Method:** Bearer Token (JWT)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Token Acquisition:**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

---

## 2. Authentication Endpoints

### 2.1 Register User

```http
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-12-19T18:00:00Z",
  "email_verified": false
}
```

### 2.2 Login

```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "secure_password"
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2.3 Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### 2.4 Logout

```http
POST /auth/logout
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 3. Project Endpoints

### 3.1 Create Project

```http
POST /projects
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "book_type": "individual_memoir",
  "title": "My Life Story",
  "subtitle": "A Journey Through Time",
  "description": "My personal memoir covering childhood through retirement",
  "target_page_count": 300,
  "target_chapter_count": 20,
  "trim_size": "6x9"
}

Response: 201 Created
{
  "id": "uuid",
  "owner_id": "uuid",
  "book_type": "individual_memoir",
  "title": "My Life Story",
  "subtitle": "A Journey Through Time",
  "description": "My personal memoir covering childhood through retirement",
  "status": "setup",
  "target_page_count": 300,
  "target_chapter_count": 20,
  "trim_size": "6x9",
  "created_at": "2025-12-19T18:00:00Z",
  "updated_at": "2025-12-19T18:00:00Z"
}
```

### 3.2 Get Project

```http
GET /projects/{project_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "owner_id": "uuid",
  "book_type": "individual_memoir",
  "title": "My Life Story",
  "status": "collecting",
  "target_page_count": 300,
  "target_chapter_count": 20,
  "trim_size": "6x9",
  "progress": {
    "fragments_count": 45,
    "chapters_ready": 3,
    "chapters_total": 20,
    "completion_percentage": 15
  },
  "created_at": "2025-12-19T18:00:00Z",
  "updated_at": "2025-12-19T18:30:00Z"
}
```

### 3.3 List Projects

```http
GET /projects?status=collecting&limit=20&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "projects": [
    {
      "id": "uuid",
      "title": "My Life Story",
      "book_type": "individual_memoir",
      "status": "collecting",
      "created_at": "2025-12-19T18:00:00Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### 3.4 Update Project

```http
PATCH /projects/{project_id}
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "My Updated Life Story",
  "target_page_count": 350
}

Response: 200 OK
{
  "id": "uuid",
  "title": "My Updated Life Story",
  "target_page_count": 350,
  "updated_at": "2025-12-19T19:00:00Z"
}
```

### 3.5 Delete Project

```http
DELETE /projects/{project_id}
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 4. Voice Profile Endpoints

### 4.1 Create Voice Profile

```http
POST /projects/{project_id}/voice-profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
{
  "writing_sample": "This is my writing sample. It represents how I naturally write...",
  "voice_recording": <audio_file>
}

Response: 201 Created
{
  "id": "uuid",
  "narrator_id": "uuid",
  "project_id": "uuid",
  "status": "processing",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 4.2 Get Voice Profile

```http
GET /projects/{project_id}/voice-profile
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "narrator_id": "uuid",
  "project_id": "uuid",
  "status": "completed",
  "characteristics": {
    "avg_sentence_length": 18.5,
    "sentence_complexity": "moderate",
    "formality_level": "conversational",
    "emotional_expression": "moderate",
    "humor_indicators": ["self-deprecating", "observational"],
    "vocabulary_range": "accessible"
  },
  "created_at": "2025-12-19T18:00:00Z",
  "updated_at": "2025-12-19T18:05:00Z"
}
```

---

## 5. Memory Fragment Endpoints

### 5.1 Create Text Memory

```http
POST /projects/{project_id}/memories
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "input_type": "text",
  "content": "I remember the summer of 1985. The red brick house on Maple Street...",
  "metadata": {
    "timeline_anchor": {
      "type": "date",
      "value": "1985-06-15",
      "confidence": "high"
    },
    "location": "Chicago, IL",
    "people_mentioned": ["Mom", "Dad", "Sister Sarah"]
  }
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "narrator_id": "uuid",
  "input_type": "text",
  "raw_content": "I remember the summer of 1985...",
  "status": "processing",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 5.2 Create Voice Memory

```http
POST /projects/{project_id}/memories
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
{
  "input_type": "voice",
  "audio_file": <audio_file>,
  "metadata": {
    "timeline_anchor": {
      "type": "life_stage",
      "value": "childhood"
    }
  }
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "narrator_id": "uuid",
  "input_type": "voice",
  "raw_content_url": "https://storage.memoirs.com/audio/uuid.mp3",
  "status": "processing",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 5.3 Create Photo Memory

```http
POST /projects/{project_id}/memories
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
{
  "input_type": "photo",
  "photo_file": <image_file>,
  "context": "Family gathering at grandma's house for Christmas",
  "metadata": {
    "timeline_anchor": {
      "type": "date",
      "value": "1985-12-25"
    },
    "people_mentioned": ["Grandma", "Mom", "Dad"]
  }
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "narrator_id": "uuid",
  "input_type": "photo",
  "status": "processing",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 5.4 Get Memory Fragment

```http
GET /projects/{project_id}/memories/{memory_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "project_id": "uuid",
  "narrator_id": "uuid",
  "input_type": "text",
  "raw_content": "I remember the summer of 1985...",
  "processed_content": "Enhanced version with better structure...",
  "status": "processed",
  "tags": {
    "life_stage": "childhood",
    "themes": ["family", "home", "summer"],
    "emotional_tone": "nostalgic",
    "key_people": ["mother", "father", "sibling"],
    "timeline_confidence": "high"
  },
  "word_count": 245,
  "created_at": "2025-12-19T18:00:00Z",
  "processed_at": "2025-12-19T18:02:00Z"
}
```

### 5.5 List Memory Fragments

```http
GET /projects/{project_id}/memories?life_stage=childhood&status=processed&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "memories": [
    {
      "id": "uuid",
      "input_type": "text",
      "status": "processed",
      "tags": {
        "life_stage": "childhood",
        "themes": ["family", "home"]
      },
      "word_count": 245,
      "created_at": "2025-12-19T18:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

### 5.6 Update Memory Fragment

```http
PATCH /projects/{project_id}/memories/{memory_id}
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "raw_content": "Updated memory content...",
  "metadata": {
    "location": "Chicago, IL (corrected)"
  }
}

Response: 200 OK
{
  "id": "uuid",
  "raw_content": "Updated memory content...",
  "status": "processing",
  "updated_at": "2025-12-19T19:00:00Z"
}
```

### 5.7 Delete Memory Fragment

```http
DELETE /projects/{project_id}/memories/{memory_id}
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 6. Chapter Endpoints

### 6.1 Check Chapter Readiness

```http
GET /projects/{project_id}/chapters/{chapter_number}/readiness
Authorization: Bearer <token>

Response: 200 OK
{
  "chapter_number": 1,
  "ready": true,
  "fragments_available": 8,
  "fragments_required": 5,
  "missing_elements": [],
  "recommendations": [
    "Sufficient fragments available for generation",
    "Timeline coverage is complete"
  ]
}

OR

Response: 200 OK
{
  "chapter_number": 2,
  "ready": false,
  "fragments_available": 3,
  "fragments_required": 5,
  "missing_elements": ["scene_setting", "reflection"],
  "recommendations": [
    "Add 2 more memory fragments",
    "Include more sensory details",
    "Add reflective thoughts about this period"
  ]
}
```

### 6.2 Generate Chapter

```http
POST /projects/{project_id}/chapters/{chapter_number}/generate
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "Summer of '85",
  "fragment_ids": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"]
}

Response: 202 Accepted
{
  "chapter_id": "uuid",
  "chapter_number": 1,
  "status": "generating",
  "estimated_completion": "2025-12-19T18:10:00Z"
}
```

### 6.3 Get Chapter

```http
GET /projects/{project_id}/chapters/{chapter_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "project_id": "uuid",
  "chapter_number": 1,
  "title": "Summer of '85",
  "content": "The summer of 1985 began like any other...",
  "status": "draft",
  "word_count": 2847,
  "target_word_count": 2500,
  "quality_score": 0.88,
  "quality_issues": [],
  "life_stage": "childhood",
  "themes": ["family", "summer", "home"],
  "created_at": "2025-12-19T18:00:00Z",
  "generated_at": "2025-12-19T18:08:00Z"
}
```

### 6.4 List Chapters

```http
GET /projects/{project_id}/chapters?status=draft
Authorization: Bearer <token>

Response: 200 OK
{
  "chapters": [
    {
      "id": "uuid",
      "chapter_number": 1,
      "title": "Summer of '85",
      "status": "draft",
      "word_count": 2847,
      "quality_score": 0.88
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

### 6.5 Update Chapter

```http
PATCH /projects/{project_id}/chapters/{chapter_id}
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "The Summer That Changed Everything",
  "content": "Updated chapter content..."
}

Response: 200 OK
{
  "id": "uuid",
  "title": "The Summer That Changed Everything",
  "status": "draft",
  "updated_at": "2025-12-19T19:00:00Z"
}
```

### 6.6 Approve Chapter

```http
POST /projects/{project_id}/chapters/{chapter_id}/approve
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "status": "approved",
  "approved_at": "2025-12-19T19:00:00Z"
}
```

### 6.7 Regenerate Chapter

```http
POST /projects/{project_id}/chapters/{chapter_id}/regenerate
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "feedback": "Please add more sensory details and expand the reflection section"
}

Response: 202 Accepted
{
  "chapter_id": "uuid",
  "status": "generating",
  "estimated_completion": "2025-12-19T19:10:00Z"
}
```

---

## 7. Manuscript Endpoints

### 7.1 Create Manuscript

```http
POST /projects/{project_id}/manuscripts
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "title": "My Life Story",
  "subtitle": "A Journey Through Time",
  "author_name": "John Doe",
  "dedication": "To my family, who made this story possible"
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "version": 1,
  "title": "My Life Story",
  "status": "draft",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 7.2 Get Manuscript

```http
GET /projects/{project_id}/manuscripts/{manuscript_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "project_id": "uuid",
  "version": 1,
  "title": "My Life Story",
  "subtitle": "A Journey Through Time",
  "author_name": "John Doe",
  "status": "draft",
  "word_count": 57234,
  "page_count": 228,
  "chapters": [
    {
      "id": "uuid",
      "chapter_number": 1,
      "title": "Summer of '85",
      "word_count": 2847
    }
  ],
  "created_at": "2025-12-19T18:00:00Z",
  "updated_at": "2025-12-19T19:00:00Z"
}
```

### 7.3 Run Quality Check

```http
POST /projects/{project_id}/manuscripts/{manuscript_id}/quality-check
Authorization: Bearer <token>

Response: 202 Accepted
{
  "manuscript_id": "uuid",
  "status": "quality_check",
  "estimated_completion": "2025-12-19T18:15:00Z"
}
```

### 7.4 Get Quality Report

```http
GET /projects/{project_id}/manuscripts/{manuscript_id}/quality-report
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "manuscript_id": "uuid",
  "overall_score": 0.87,
  "passed": true,
  "checks": {
    "repetition_detection": {
      "passed": true,
      "score": 0.92,
      "issues": []
    },
    "timeline_coherence": {
      "passed": true,
      "score": 0.95,
      "issues": []
    },
    "chapter_length_validation": {
      "passed": true,
      "score": 0.88,
      "issues": []
    },
    "emotional_balance": {
      "passed": true,
      "score": 0.85,
      "details": {
        "variety_score": 0.85,
        "positive_ratio": 0.45,
        "negative_ratio": 0.30,
        "neutral_ratio": 0.25
      }
    },
    "filler_language": {
      "passed": true,
      "score": 0.90,
      "details": {
        "weak_verb_percentage": 12,
        "qualifier_density": 1.5
      }
    }
  },
  "recommendations": [],
  "created_at": "2025-12-19T18:15:00Z"
}
```

### 7.5 Generate Print PDF

```http
POST /projects/{project_id}/manuscripts/{manuscript_id}/generate-pdf
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "print_specs": {
    "trim_size": "6x9",
    "binding": "hardcover",
    "paper_type": "cream",
    "cover_finish": "matte"
  }
}

Response: 202 Accepted
{
  "manuscript_id": "uuid",
  "status": "generating_pdf",
  "estimated_completion": "2025-12-19T18:20:00Z"
}
```

### 7.6 Get Print PDF

```http
GET /projects/{project_id}/manuscripts/{manuscript_id}/pdf
Authorization: Bearer <token>

Response: 200 OK
{
  "manuscript_id": "uuid",
  "pdf_url": "https://storage.memoirs.com/pdfs/uuid.pdf",
  "cover_pdf_url": "https://storage.memoirs.com/pdfs/uuid-cover.pdf",
  "generated_at": "2025-12-19T18:20:00Z",
  "expires_at": "2025-12-26T18:20:00Z"
}
```

---

## 8. Collaboration Endpoints

### 8.1 Invite Collaborator

```http
POST /projects/{project_id}/collaborators
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "email": "collaborator@example.com",
  "role": "contributor",
  "permissions": {
    "can_provide_feedback": true,
    "can_submit_corrections": true,
    "can_view_drafts": true
  }
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "email": "collaborator@example.com",
  "role": "contributor",
  "status": "pending",
  "invited_at": "2025-12-19T18:00:00Z"
}
```

### 8.2 List Collaborators

```http
GET /projects/{project_id}/collaborators
Authorization: Bearer <token>

Response: 200 OK
{
  "collaborators": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "contributor",
      "status": "accepted",
      "accepted_at": "2025-12-19T18:30:00Z"
    }
  ],
  "total": 1
}
```

### 8.3 Submit Feedback

```http
POST /projects/{project_id}/feedback
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "target_type": "chapter",
  "target_id": "uuid",
  "feedback_type": "correction",
  "content": "The date should be June 15, not June 16"
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "collaborator_id": "uuid",
  "target_type": "chapter",
  "target_id": "uuid",
  "feedback_type": "correction",
  "content": "The date should be June 15, not June 16",
  "status": "pending",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 8.4 Submit Letter

```http
POST /projects/{project_id}/letters
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "recipient_name": "Dad",
  "content": "Dear Dad, I wanted to share my perspective on...",
  "placement": "afterword"
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "author_id": "uuid",
  "recipient_name": "Dad",
  "placement": "afterword",
  "status": "submitted",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 8.5 Flag Perspective Conflict (Family Memoir)

```http
POST /projects/{project_id}/conflicts
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "fragment_ids": ["uuid1", "uuid2"],
  "description": "Different memories of the same event - Dad remembers it in summer, I remember it in fall"
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "fragment_ids": ["uuid1", "uuid2"],
  "description": "Different memories of the same event...",
  "status": "flagged",
  "created_at": "2025-12-19T18:00:00Z"
}
```

---

## 9. Media Endpoints

### 9.1 Upload Photo

```http
POST /projects/{project_id}/media/photos
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
{
  "file": <image_file>,
  "context": "Family gathering at grandma's house",
  "caption": "Christmas 1985",
  "metadata": {
    "date_taken": "1985-12-25",
    "people_in_photo": ["Grandma", "Mom", "Dad"]
  }
}

Response: 201 Created
{
  "id": "uuid",
  "project_id": "uuid",
  "file_type": "photo",
  "storage_url": "https://storage.memoirs.com/photos/uuid.jpg",
  "original_filename": "christmas1985.jpg",
  "file_size": 2457600,
  "metadata": {
    "resolution": "3000x2000",
    "dpi": 300,
    "context": "Family gathering at grandma's house",
    "caption": "Christmas 1985"
  },
  "status": "ready",
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 9.2 List Media Files

```http
GET /projects/{project_id}/media?file_type=photo&status=ready
Authorization: Bearer <token>

Response: 200 OK
{
  "media_files": [
    {
      "id": "uuid",
      "file_type": "photo",
      "storage_url": "https://storage.memoirs.com/photos/uuid.jpg",
      "metadata": {
        "caption": "Christmas 1985"
      },
      "status": "ready"
    }
  ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

### 9.3 Delete Media File

```http
DELETE /projects/{project_id}/media/{media_id}
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 10. Print Job Endpoints

### 10.1 Create Print Job

```http
POST /projects/{project_id}/print-jobs
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "manuscript_id": "uuid",
  "print_service": "Blurb",
  "specifications": {
    "trim_size": "6x9",
    "page_count": 324,
    "binding": "hardcover",
    "paper_type": "cream",
    "cover_finish": "matte",
    "quantity": 1
  },
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Chicago",
    "state": "IL",
    "zip": "60601",
    "country": "USA"
  }
}

Response: 201 Created
{
  "id": "uuid",
  "manuscript_id": "uuid",
  "project_id": "uuid",
  "print_service": "Blurb",
  "status": "pending",
  "cost_estimate": 45.99,
  "created_at": "2025-12-19T18:00:00Z"
}
```

### 10.2 Get Print Job

```http
GET /projects/{project_id}/print-jobs/{print_job_id}
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "manuscript_id": "uuid",
  "project_id": "uuid",
  "print_service": "Blurb",
  "order_id": "BLB-12345",
  "status": "printing",
  "cost_final": 45.99,
  "tracking_number": "1Z999AA10123456784",
  "created_at": "2025-12-19T18:00:00Z",
  "submitted_at": "2025-12-19T18:30:00Z"
}
```

---

## 11. Error Responses

### 11.1 Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional context"
    },
    "request_id": "uuid"
  }
}
```

### 11.2 Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Request validation failed |
| 401 | `UNAUTHORIZED` | Authentication required |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict (e.g., duplicate) |
| 422 | `UNPROCESSABLE_ENTITY` | Business logic validation failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

### 11.3 Validation Errors

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": {
      "fields": {
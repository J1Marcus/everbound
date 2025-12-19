# Digital Memoir Platform - Data Model & Schema Design

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Authoritative

## Document Purpose

This document defines the complete data model for the Digital Memoir Platform, ensuring data structures support the assembly-based narrative generation, voice preservation, and print-first requirements.

---

## 1. Data Model Overview

### 1.1 Core Entities

The data model is organized around these core entities:

1. **Users & Authentication:** User accounts and authentication
2. **Projects:** Book projects (Individual or Family Memoir)
3. **Memory Fragments:** Raw input from users
4. **Voice Profiles:** Narrator voice characteristics
5. **Narrative Components:** Generated prose elements
6. **Chapters & Manuscripts:** Assembled book content
7. **Collaborations:** Multi-user interactions
8. **Media Files:** Photos and audio recordings
9. **Quality Reports:** Automated quality assessments
10. **Print Specifications:** Print production metadata

### 1.2 Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌─────────────┐                   ┌──────────────┐
│  Projects   │◄──────────────────│Voice Profiles│
└──────┬──────┘                   └──────────────┘
       │
       ├────────────┬────────────┬────────────┐
       │            │            │            │
       ▼            ▼            ▼            ▼
┌──────────┐  ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Memory   │  │Narrative │ │  Media   │ │Collabor- │
│Fragments │  │Components│ │  Files   │ │ations    │
└────┬─────┘  └────┬─────┘ └──────────┘ └──────────┘
     │             │
     └──────┬──────┘
            │
            ▼
     ┌──────────┐
     │ Chapters │
     └────┬─────┘
          │
          ▼
     ┌──────────┐
     │Manuscripts│
     └────┬─────┘
          │
          ▼
     ┌──────────┐
     │ Quality  │
     │ Reports  │
     └──────────┘
```

---

## 2. Schema Definitions

### 2.1 Users & Authentication

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

#### user_sessions
```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
```

---

### 2.2 Projects

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_type VARCHAR(50) NOT NULL CHECK (book_type IN ('individual_memoir', 'family_memoir')),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    status VARCHAR(50) DEFAULT 'setup' CHECK (status IN (
        'setup',           -- Initial project creation
        'calibrating',     -- Voice calibration in progress
        'collecting',      -- Collecting memory fragments
        'assembling',      -- Generating chapters
        'reviewing',       -- User review and refinement
        'quality_check',   -- Running quality gates
        'print_ready',     -- Passed quality gates
        'printing',        -- Sent to print service
        'completed'        -- Book delivered
    )),
    target_page_count INTEGER DEFAULT 300 CHECK (target_page_count BETWEEN 100 AND 600),
    target_chapter_count INTEGER DEFAULT 20 CHECK (target_chapter_count BETWEEN 5 AND 50),
    trim_size VARCHAR(50) DEFAULT '6x9' CHECK (trim_size IN ('6x9', '7x10', '8.5x11')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_book_type ON projects(book_type);
```

#### project_settings
```sql
CREATE TABLE project_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, setting_key)
);

CREATE INDEX idx_project_settings_project_id ON project_settings(project_id);
```

---

### 2.3 Collaborations

#### project_collaborators
```sql
CREATE TABLE project_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'narrator',      -- Primary author (Individual Memoir)
        'co_narrator',   -- Independent author (Family Memoir)
        'contributor',   -- Can provide feedback/corrections
        'reviewer'       -- Read-only access
    )),
    permissions JSONB DEFAULT '{
        "can_add_memories": false,
        "can_edit_own_memories": false,
        "can_provide_feedback": false,
        "can_submit_corrections": false,
        "can_submit_letters": false,
        "can_approve_chapters": false,
        "can_view_drafts": false
    }'::jsonb,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    accepted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'removed')),
    UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_collaborators_project_id ON project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_user_id ON project_collaborators(user_id);
CREATE INDEX idx_project_collaborators_status ON project_collaborators(status);
```

#### collaboration_feedback
```sql
CREATE TABLE collaboration_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    collaborator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('chapter', 'fragment', 'manuscript')),
    target_id UUID NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN (
        'comment',
        'correction',
        'suggestion',
        'question'
    )),
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    response TEXT
);

CREATE INDEX idx_collaboration_feedback_project_id ON collaboration_feedback(project_id);
CREATE INDEX idx_collaboration_feedback_target ON collaboration_feedback(target_type, target_id);
CREATE INDEX idx_collaboration_feedback_status ON collaboration_feedback(status);
```

#### collaboration_letters
```sql
CREATE TABLE collaboration_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255),
    content TEXT NOT NULL,
    placement VARCHAR(50) CHECK (placement IN ('foreword', 'afterword', 'dedication', 'standalone')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'included')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_collaboration_letters_project_id ON collaboration_letters(project_id);
CREATE INDEX idx_collaboration_letters_author_id ON collaboration_letters(author_id);
```

---

### 2.4 Voice Profiles

#### voice_profiles
```sql
CREATE TABLE voice_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    narrator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    writing_sample TEXT NOT NULL,
    writing_sample_word_count INTEGER,
    voice_recording_url TEXT,
    voice_recording_duration INTEGER, -- seconds
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN (
        'processing',
        'completed',
        'failed'
    )),
    characteristics JSONB DEFAULT '{}'::jsonb,
    -- Example characteristics structure:
    -- {
    --   "avg_sentence_length": 18.5,
    --   "sentence_complexity": "moderate",
    --   "formality_level": "conversational",
    --   "emotional_expression": "moderate",
    --   "humor_indicators": ["self-deprecating", "observational"],
    --   "vocabulary_range": "accessible",
    --   "punctuation_patterns": {
    --     "comma_frequency": "high",
    --     "dash_usage": "moderate",
    --     "exclamation_usage": "low"
    --   },
    --   "sentence_structure": {
    --     "simple": 0.45,
    --     "compound": 0.35,
    --     "complex": 0.20
    --   }
    -- }
    constraints JSONB DEFAULT '{}'::jsonb,
    -- Example constraints structure:
    -- {
    --   "max_sentence_length": 25,
    --   "min_sentence_length": 8,
    --   "preferred_vocabulary": ["family", "home", "remember"],
    --   "avoid_patterns": ["very", "really", "just"],
    --   "tone_guidelines": "warm and reflective"
    -- }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(narrator_id, project_id)
);

CREATE INDEX idx_voice_profiles_narrator_id ON voice_profiles(narrator_id);
CREATE INDEX idx_voice_profiles_project_id ON voice_profiles(project_id);
CREATE INDEX idx_voice_profiles_status ON voice_profiles(status);
```

---

### 2.5 Memory Fragments

#### memory_fragments
```sql
CREATE TABLE memory_fragments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    narrator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_type VARCHAR(50) NOT NULL CHECK (input_type IN ('text', 'voice', 'photo')),
    raw_content TEXT,
    raw_content_url TEXT, -- For audio/large files
    processed_content TEXT,
    transcription TEXT, -- For voice inputs
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata structure:
    -- {
    --   "date_captured": "2025-12-19T18:00:00Z",
    --   "timeline_anchor": {
    --     "type": "date",
    --     "value": "1985-06-15",
    --     "confidence": "high"
    --   },
    --   "location": "Chicago, IL",
    --   "people_mentioned": ["Mom", "Dad", "Sister Sarah"],
    --   "sensory_details": {
    --     "visual": ["red brick house", "oak tree"],
    --     "auditory": ["laughter", "screen door"],
    --     "olfactory": ["fresh bread"],
    --     "tactile": ["warm sun"],
    --     "gustatory": []
    --   }
    -- }
    tags JSONB DEFAULT '{}'::jsonb,
    -- Example tags structure:
    -- {
    --   "life_stage": "childhood",
    --   "themes": ["family", "home", "summer"],
    --   "emotional_tone": "nostalgic",
    --   "key_people": ["mother", "father", "sibling"],
    --   "timeline_confidence": "high",
    --   "narrative_potential": "high"
    -- }
    status VARCHAR(50) DEFAULT 'raw' CHECK (status IN (
        'raw',          -- Just captured
        'processing',   -- Being analyzed
        'processed',    -- Tags and analysis complete
        'validated',    -- Approved for use
        'used',         -- Included in chapter
        'archived'      -- Not used but kept
    )),
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_memory_fragments_project_id ON memory_fragments(project_id);
CREATE INDEX idx_memory_fragments_narrator_id ON memory_fragments(narrator_id);
CREATE INDEX idx_memory_fragments_status ON memory_fragments(status);
CREATE INDEX idx_memory_fragments_tags ON memory_fragments USING GIN (tags);
CREATE INDEX idx_memory_fragments_life_stage ON memory_fragments ((tags->>'life_stage'));
```

---

### 2.6 Narrative Components

#### narrative_components
```sql
CREATE TABLE narrative_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    component_type VARCHAR(50) NOT NULL CHECK (component_type IN (
        'scene_setting',
        'narrative_moment',
        'reflection',
        'lesson',
        'transition'
    )),
    source_fragments UUID[] NOT NULL, -- Array of memory_fragment IDs
    generated_prose TEXT NOT NULL,
    voice_profile_id UUID REFERENCES voice_profiles(id),
    generation_metadata JSONB DEFAULT '{}'::jsonb,
    -- Example generation_metadata:
    -- {
    --   "model": "gpt-4",
    --   "temperature": 0.7,
    --   "prompt_version": "v2.1",
    --   "generation_timestamp": "2025-12-19T18:00:00Z",
    --   "voice_constraints_applied": true
    -- }
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    quality_issues JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'validated',
        'approved',
        'rejected'
    )),
    word_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_narrative_components_project_id ON narrative_components(project_id);
CREATE INDEX idx_narrative_components_chapter_id ON narrative_components(chapter_id);
CREATE INDEX idx_narrative_components_type ON narrative_components(component_type);
CREATE INDEX idx_narrative_components_status ON narrative_components(status);
```

---

### 2.7 Chapters & Manuscripts

#### chapters
```sql
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title VARCHAR(500),
    subtitle VARCHAR(500),
    content TEXT,
    component_ids UUID[], -- Array of narrative_component IDs
    life_stage VARCHAR(50),
    themes TEXT[],
    timeline_start DATE,
    timeline_end DATE,
    word_count INTEGER,
    target_word_count INTEGER DEFAULT 2500,
    status VARCHAR(50) DEFAULT 'insufficient' CHECK (status IN (
        'insufficient',  -- Not enough fragments
        'ready',         -- Enough fragments, can generate
        'generating',    -- Generation in progress
        'draft',         -- Generated, needs review
        'validated',     -- Passed quality checks
        'approved'       -- User approved
    )),
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    quality_issues JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, chapter_number)
);

CREATE INDEX idx_chapters_project_id ON chapters(project_id);
CREATE INDEX idx_chapters_manuscript_id ON chapters(manuscript_id);
CREATE INDEX idx_chapters_status ON chapters(status);
CREATE INDEX idx_chapters_life_stage ON chapters(life_stage);
```

#### manuscripts
```sql
CREATE TABLE manuscripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    author_name VARCHAR(255) NOT NULL,
    dedication TEXT,
    foreword TEXT,
    afterword TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',
        'review',
        'quality_check',
        'quality_failed',
        'print_ready',
        'printing',
        'completed'
    )),
    content JSONB DEFAULT '{}'::jsonb,
    -- Example content structure:
    -- {
    --   "front_matter": {
    --     "title_page": {...},
    --     "copyright_page": {...},
    --     "dedication": "...",
    --     "table_of_contents": [...]
    --   },
    --   "chapters": [...],
    --   "back_matter": {
    --     "afterword": "...",
    --     "acknowledgments": "...",
    --     "about_author": "..."
    --   }
    -- }
    quality_report_id UUID REFERENCES quality_reports(id),
    print_specs JSONB DEFAULT '{}'::jsonb,
    -- Example print_specs:
    -- {
    --   "trim_size": "6x9",
    --   "page_count": 324,
    --   "interior_color": "black_and_white",
    --   "paper_type": "cream",
    --   "binding": "hardcover",
    --   "cover_finish": "matte"
    -- }
    word_count INTEGER,
    page_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    print_ready_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, version)
);

CREATE INDEX idx_manuscripts_project_id ON manuscripts(project_id);
CREATE INDEX idx_manuscripts_status ON manuscripts(status);
CREATE INDEX idx_manuscripts_version ON manuscripts(project_id, version);
```

---

### 2.8 Media Files

#### media_files
```sql
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('photo', 'audio', 'document')),
    storage_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL, -- bytes
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Example metadata for photos:
    -- {
    --   "resolution": "3000x2000",
    --   "dpi": 300,
    --   "color_space": "sRGB",
    --   "format": "JPEG",
    --   "context": "Family gathering at grandma's house",
    --   "caption": "Christmas 1985",
    --   "date_taken": "1985-12-25",
    --   "people_in_photo": ["Mom", "Dad", "Me"]
    -- }
    -- Example metadata for audio:
    -- {
    --   "duration": 180,
    --   "format": "MP3",
    --   "bitrate": 128,
    --   "sample_rate": 44100
    -- }
    usage JSONB DEFAULT '{}'::jsonb,
    -- Example usage:
    -- {
    --   "chapters": ["uuid1", "uuid2"],
    --   "placement": "full_page",
    --   "page_number": 45
    -- }
    status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN (
        'uploaded',
        'processing',
        'ready',
        'used',
        'archived'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_files_project_id ON media_files(project_id);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_status ON media_files(status);
```

---

### 2.9 Quality Reports

#### quality_reports
```sql
CREATE TABLE quality_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    report_type VARCHAR(50) DEFAULT 'full' CHECK (report_type IN ('full', 'chapter', 'incremental')),
    overall_score FLOAT CHECK (overall_score BETWEEN 0 AND 1),
    passed BOOLEAN DEFAULT FALSE,
    checks JSONB NOT NULL,
    -- Example checks structure:
    -- {
    --   "repetition_detection": {
    --     "passed": true,
    --     "score": 0.92,
    --     "issues": [],
    --     "details": {
    --       "repeated_phrases": 2,
    --       "threshold": 3,
    --       "max_similarity": 0.78
    --     }
    --   },
    --   "timeline_coherence": {
    --     "passed": true,
    --     "score": 0.95,
    --     "issues": [],
    --     "details": {
    --       "conflicts": 0,
    --       "confidence_avg": 0.88
    --     }
    --   },
    --   "chapter_length_validation": {
    --     "passed": false,
    --     "score": 0.65,
    --     "issues": [
    --       {
    --         "chapter_id": "uuid",
    --         "chapter_number": 3,
    --         "word_count": 1200,
    --         "target": 2500,
    --         "message": "Chapter 3 is below minimum length"
    --       }
    --     ]
    --   },
    --   "emotional_balance": {
    --     "passed": true,
    --     "score": 0.88,
    --     "details": {
    --       "variety_score": 0.85,
    --       "positive_ratio": 0.45,
    --       "negative_ratio": 0.30,
    --       "neutral_ratio": 0.25
    --     }
    --   },
    --   "filler_language": {
    --     "passed": true,
    --     "score": 0.90,
    --     "details": {
    --       "weak_verb_percentage": 12,
    --       "qualifier_density": 1.5,
    --       "cliche_count": 3
    --     }
    --   }
    -- }
    recommendations JSONB DEFAULT '[]'::jsonb,
    -- Example recommendations:
    -- [
    --   {
    --     "type": "add_content",
    --     "priority": "high",
    --     "target": "chapter_3",
    --     "message": "Add 1,300 more words to Chapter 3",
    --     "suggestions": ["Expand on the summer vacation memory", "Add more sensory details"]
    --   }
    -- ]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quality_reports_manuscript_id ON quality_reports(manuscript_id);
CREATE INDEX idx_quality_reports_passed ON quality_reports(passed);
```

---

### 2.10 Timeline & Events

#### timeline_events
```sql
CREATE TABLE timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    narrator_id UUID REFERENCES users(id),
    event_type VARCHAR(50) CHECK (event_type IN (
        'birth',
        'milestone',
        'memory',
        'life_stage_transition',
        'significant_event'
    )),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    date_type VARCHAR(50) CHECK (date_type IN ('exact', 'approximate', 'range', 'life_stage')),
    date_exact DATE,
    date_approximate VARCHAR(100), -- e.g., "Summer 1985", "Early 1990s"
    date_range_start DATE,
    date_range_end DATE,
    life_stage VARCHAR(50),
    confidence VARCHAR(50) CHECK (confidence IN ('high', 'medium', 'low')),
    source_fragments UUID[], -- Array of memory_fragment IDs
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_project_id ON timeline_events(project_id);
CREATE INDEX idx_timeline_events_narrator_id ON timeline_events(narrator_id);
CREATE INDEX idx_timeline_events_date_exact ON timeline_events(date_exact);
CREATE INDEX idx_timeline_events_life_stage ON timeline_events(life_stage);
```

---

### 2.11 Print Production

#### print_jobs
```sql
CREATE TABLE print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manuscript_id UUID NOT NULL REFERENCES manuscripts(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    print_service VARCHAR(100), -- e.g., "Blurb", "Lulu", "IngramSpark"
    order_id VARCHAR(255), -- External order ID
    pdf_url TEXT NOT NULL,
    cover_pdf_url TEXT,
    specifications JSONB NOT NULL,
    -- Example specifications:
    -- {
    --   "trim_size": "6x9",
    --   "page_count": 324,
    --   "binding": "hardcover",
    --   "paper_type": "cream",
    --   "cover_finish": "matte",
    --   "quantity": 1,
    --   "isbn": "978-1-234567-89-0"
    -- }
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',
        'submitted',
        'processing',
        'printing',
        'shipped',
        'delivered',
        'cancelled',
        'failed'
    )),
    cost_estimate DECIMAL(10, 2),
    cost_final DECIMAL(10, 2),
    tracking_number VARCHAR(255),
    shipping_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_print_jobs_manuscript_id ON print_jobs(manuscript_id);
CREATE INDEX idx_print_jobs_project_id ON print_jobs(project_id);
CREATE INDEX idx_print_jobs_user_id ON print_jobs(user_id);
CREATE INDEX idx_print_jobs_status ON print_jobs(status);
```

---

## 3. Data Relationships

### 3.1 One-to-Many Relationships

- **User → Projects:** One user can own multiple projects
- **Project → Memory Fragments:** One project contains many memory fragments
- **Project → Chapters:** One project contains many chapters
- **Project → Manuscripts:** One project can have multiple manuscript versions
- **Chapter → Narrative Components:** One chapter contains multiple narrative components
- **Voice Profile → Narrative Components:** One voice profile constrains many components

### 3.2 Many-to-Many Relationships

- **Projects ↔ Users (via project_collaborators):** Projects can have multiple collaborators, users can collaborate on multiple projects
- **Memory Fragments ↔ Narrative Components:** Fragments can be used in multiple components, components can use multiple fragments
- **Memory Fragments ↔ Chapters:** Fragments can contribute to multiple chapters

### 3.3 One-to-One Relationships

- **User → Voice Profile (per project):** Each narrator has one voice profile per project
- **Manuscript → Quality Report:** Each manuscript version has one quality report

---

## 4. Data Constraints & Business Rules

### 4.1 Project Constraints

1. **Book Type Immutability:** Once set, `book_type` cannot be changed
2. **Owner Requirement:** Every project must have exactly one owner
3. **Status Progression:** Status must follow logical progression (cannot skip from 'setup' to 'print_ready')
4. **Target Limits:** Page count (100-600), chapter count (5-50)

### 4.2 Memory Fragment Constraints

1. **Narrator Validation:** Narrator must be project owner or approved co-narrator
2. **Content Requirement:** Either `raw_content` or `raw_content_url` must be present
3. **Processing Sequence:** Status must progress from 'raw' → 'processing' → 'processed'
4. **Tag Requirement:** Processed fragments must have tags

### 4.3 Chapter Constraints

1. **Unique Chapter Numbers:** No duplicate chapter numbers within a project
2. **Sequential Numbering:** Chapter numbers should be sequential (1, 2, 3...)
3. **Word Count Limits:** Minimum 1,500 words, maximum 5,000 words
4. **Component Requirement:** Approved chapters must have at least 3 narrative components
5. **Generation Blocking:** Cannot generate if status is 'insufficient'

### 4.4 Voice Profile Constraints

1. **Uniqueness:** One voice profile per narrator per project
2. **Sample Requirements:** Both writing sample and voice recording required
3. **Minimum Sample Length:** Writing sample
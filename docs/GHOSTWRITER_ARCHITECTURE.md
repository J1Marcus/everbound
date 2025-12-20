# Ghostwriter Workflow Architecture

**Version:** 1.0  
**Last Updated:** 2025-12-19  
**Status:** Implementation Specification

## Document Purpose

This document provides the complete technical architecture for implementing the Professional Ghostwriter Workflow in the Digital Memoir Platform. It includes database schema extensions, API specifications, data flow diagrams, RLS policies, and migration scripts needed to transform the platform from an open-ended memory capture system into a structured, intelligent interview process.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema Design](#2-database-schema-design)
3. [SQL Migration Scripts](#3-sql-migration-scripts)
4. [API Endpoint Specifications](#4-api-endpoint-specifications)
5. [Row-Level Security Policies](#5-row-level-security-policies)
6. [Data Flow Diagrams](#6-data-flow-diagrams)
7. [Integration Points](#7-integration-points)
8. [Photo Intelligence Architecture](#8-photo-intelligence-architecture)
9. [Implementation Phases](#9-implementation-phases)
10. [Potential Conflicts & Resolutions](#10-potential-conflicts--resolutions)
11. [Performance Considerations](#11-performance-considerations)
12. [Testing Strategy](#12-testing-strategy)

---

## 1. Architecture Overview

### 1.1 System Transformation

The Ghostwriter Workflow introduces a structured, guided approach to memoir creation:

**Before:**
- Generic "Add Text Memory" button
- Unstructured memory capture
- No guidance or context

**After:**
- Profile-driven section roadmap
- Scene-based prompts with sensory details
- Photo intelligence integration
- Progressive unlocking system
- Synthesis checkpoints with quality feedback

### 1.2 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Ghostwriter Workflow                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Profile    │───▶│   Section    │───▶│   Prompt     │ │
│  │ Questionnaire│    │   Roadmap    │    │   Engine     │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            User Profile & Timeline Data              │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │    Photo     │    │   Memory     │    │  Synthesis   │ │
│  │ Intelligence │    │  Fragments   │    │  Checkpoint  │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                    │         │
│         └────────────────────┴────────────────────┘         │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  Chapter Preview │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Key Design Principles

1. **Backward Compatibility:** Existing memoir capture functionality remains intact
2. **Progressive Enhancement:** New features layer on top of existing architecture
3. **Data Integrity:** All new tables properly reference existing schema
4. **Performance First:** Indexes and optimizations for photo analysis queries
5. **Privacy Respect:** Tiered sensitivity with privacy controls

---

## 2. Database Schema Design

### 2.1 New Table: `user_profiles`

Stores the gentle profile questionnaire responses and timeline anchors.

```sql
CREATE TABLE user_profiles (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Relationship & Family
    marital_status VARCHAR(50) CHECK (marital_status IN (
        'married', 'partnered', 'previously_married', 
        'previously_partnered', 'never_married', 'prefer_not_to_say'
    )),
    has_children BOOLEAN DEFAULT FALSE,
    has_siblings BOOLEAN DEFAULT FALSE,
    raised_by VARCHAR(100) CHECK (raised_by IN (
        'both_parents', 'single_parent', 'grandparents', 
        'other_family', 'foster_care', 'prefer_not_to_say'
    )),
    
    -- Life Structure
    military_service BOOLEAN DEFAULT FALSE,
    career_type VARCHAR(50) CHECK (career_type IN (
        'single_career', 'multiple_careers', 'entrepreneur', 
        'homemaker', 'varied', 'prefer_not_to_say'
    )),
    lived_multiple_places BOOLEAN DEFAULT FALSE,
    travel_important BOOLEAN DEFAULT FALSE,
    faith_important BOOLEAN DEFAULT FALSE,
    
    -- Comfort Boundaries (Privacy Controls)
    comfortable_romance BOOLEAN DEFAULT FALSE,
    comfortable_trauma BOOLEAN DEFAULT FALSE,
    skip_personal BOOLEAN DEFAULT FALSE,
    
    -- Timeline Anchors
    birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    grew_up_location VARCHAR(255),
    high_school_years VARCHAR(50), -- e.g., "1965-1969"
    first_job_age INTEGER CHECK (first_job_age >= 10 AND first_job_age <= 30),
    major_moves JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"year": 1985, "from": "Chicago, IL", "to": "Seattle, WA", "reason": "job"}]
    partner_met_year INTEGER,
    children_birth_years INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    milestones JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"year": 1990, "event": "Started business", "significance": "high"}]
    
    -- Book Flavor/Tone
    book_tone VARCHAR(50) CHECK (book_tone IN (
        'reflective', 'warm', 'humorous', 'direct', 'conversational'
    )),
    
    -- Metadata
    profile_completed BOOLEAN DEFAULT FALSE,
    profile_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, project_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_project_id ON user_profiles(project_id);
CREATE INDEX idx_user_profiles_completed ON user_profiles(profile_completed);
CREATE INDEX idx_user_profiles_birth_year ON user_profiles(birth_year);

-- Trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 New Table: `memoir_sections`

Defines the personalized chapter roadmap and tracks progress through sections.

```sql
CREATE TABLE memoir_sections (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Section Definition
    section_key VARCHAR(100) NOT NULL, -- e.g., "origins", "childhood", "teen_years"
    section_title VARCHAR(255) NOT NULL, -- e.g., "Origins", "Childhood Memories"
    section_description TEXT,
    section_order INTEGER NOT NULL, -- Display order: 1, 2, 3...
    
    -- Section Type & Visibility
    is_core BOOLEAN DEFAULT TRUE, -- Core sections vs conditional sections
    is_conditional BOOLEAN DEFAULT FALSE, -- Shown based on profile
    condition_key VARCHAR(100), -- Profile field that enables this section
    condition_value BOOLEAN, -- Required value to show section
    
    -- Progress Tracking
    is_unlocked BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Memory Requirements
    required_memories INTEGER DEFAULT 5,
    collected_memories INTEGER DEFAULT 0,
    target_word_count INTEGER DEFAULT 2000,
    current_word_count INTEGER DEFAULT 0,
    
    -- Prompts Structure
    prompts JSONB NOT NULL DEFAULT '[]'::jsonb,
    -- Example structure:
    -- [
    --   {
    --     "id": "origins_001",
    --     "type": "scene",
    --     "tier": 1,
    --     "question": "Take me to the house you were born in...",
    --     "guidance": "Describe sensory details: smells, sounds, textures",
    --     "target_words": 200,
    --     "photo_encouraged": true,
    --     "completed": false
    --   }
    -- ]
    
    -- Quality Metrics
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    quality_issues JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, section_key)
);

-- Indexes
CREATE INDEX idx_memoir_sections_project_id ON memoir_sections(project_id);
CREATE INDEX idx_memoir_sections_order ON memoir_sections(project_id, section_order);
CREATE INDEX idx_memoir_sections_unlocked ON memoir_sections(project_id, is_unlocked);
CREATE INDEX idx_memoir_sections_completed ON memoir_sections(project_id, is_completed);
CREATE INDEX idx_memoir_sections_conditional ON memoir_sections(is_conditional, condition_key);
CREATE INDEX idx_memoir_sections_prompts ON memoir_sections USING GIN (prompts);

-- Trigger for updated_at
CREATE TRIGGER update_memoir_sections_updated_at
    BEFORE UPDATE ON memoir_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 New Table: `section_prompts`

Normalized prompt storage for better querying and management.

```sql
CREATE TABLE section_prompts (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES memoir_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Prompt Definition
    prompt_key VARCHAR(100) NOT NULL, -- e.g., "origins_house_001"
    prompt_order INTEGER NOT NULL,
    prompt_type VARCHAR(50) NOT NULL CHECK (prompt_type IN (
        'scene', 'people', 'tension', 'change', 'meaning', 
        'sensory', 'reflection', 'photo_context'
    )),
    
    -- Prompt Content
    question TEXT NOT NULL,
    guidance TEXT,
    example_response TEXT,
    
    -- Requirements
    target_word_count INTEGER DEFAULT 200,
    min_word_count INTEGER DEFAULT 50,
    max_word_count INTEGER DEFAULT 1000,
    
    -- Sensitivity & Privacy
    sensitivity_tier INTEGER DEFAULT 1 CHECK (sensitivity_tier BETWEEN 1 AND 4),
    requires_comfort_flag VARCHAR(50), -- e.g., "comfortable_romance"
    privacy_default VARCHAR(50) DEFAULT 'included' CHECK (privacy_default IN (
        'included', 'private_notes', 'ask_user'
    )),
    
    -- Photo Integration
    photo_encouraged BOOLEAN DEFAULT FALSE,
    photo_required BOOLEAN DEFAULT FALSE,
    photo_prompt TEXT, -- Specific guidance for photo upload
    
    -- Response Tracking
    is_completed BOOLEAN DEFAULT FALSE,
    response_count INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(section_id, prompt_key)
);

-- Indexes
CREATE INDEX idx_section_prompts_section_id ON section_prompts(section_id);
CREATE INDEX idx_section_prompts_project_id ON section_prompts(project_id);
CREATE INDEX idx_section_prompts_order ON section_prompts(section_id, prompt_order);
CREATE INDEX idx_section_prompts_completed ON section_prompts(section_id, is_completed);
CREATE INDEX idx_section_prompts_sensitivity ON section_prompts(sensitivity_tier);

-- Trigger for updated_at
CREATE TRIGGER update_section_prompts_updated_at
    BEFORE UPDATE ON section_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 Extensions to `memory_fragments` Table

Add columns to link fragments to sections and prompts, and support photo intelligence.

```sql
-- Add new columns to memory_fragments
ALTER TABLE memory_fragments
ADD COLUMN section_id UUID REFERENCES memoir_sections(id) ON DELETE SET NULL,
ADD COLUMN prompt_id UUID REFERENCES section_prompts(id) ON DELETE SET NULL,
ADD COLUMN photo_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
ADD COLUMN ai_enhanced_content TEXT,
ADD COLUMN privacy_level VARCHAR(50) DEFAULT 'included' CHECK (privacy_level IN (
    'included', 'private_notes', 'excluded'
)),
ADD COLUMN word_count INTEGER,
ADD COLUMN sensory_richness_score FLOAT CHECK (sensory_richness_score BETWEEN 0 AND 1),
ADD COLUMN emotional_depth_score FLOAT CHECK (emotional_depth_score BETWEEN 0 AND 1);

-- Add indexes for new columns
CREATE INDEX idx_memory_fragments_section_id ON memory_fragments(section_id);
CREATE INDEX idx_memory_fragments_prompt_id ON memory_fragments(prompt_id);
CREATE INDEX idx_memory_fragments_photo_id ON memory_fragments(photo_id);
CREATE INDEX idx_memory_fragments_privacy ON memory_fragments(privacy_level);
CREATE INDEX idx_memory_fragments_quality ON memory_fragments(sensory_richness_score, emotional_depth_score);

-- Add comment for documentation
COMMENT ON COLUMN memory_fragments.section_id IS 'Links fragment to a specific memoir section';
COMMENT ON COLUMN memory_fragments.prompt_id IS 'Links fragment to the prompt that generated it';
COMMENT ON COLUMN memory_fragments.photo_id IS 'Links fragment to an associated photo';
COMMENT ON COLUMN memory_fragments.ai_enhanced_content IS 'AI-enhanced version with photo intelligence';
COMMENT ON COLUMN memory_fragments.privacy_level IS 'User privacy preference for this memory';
```

### 2.5 New Table: `media_files` (if not exists) or Extensions

Create or extend the media_files table to support photo intelligence.

```sql
-- Create media_files table if it doesn't exist
CREATE TABLE IF NOT EXISTS media_files (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- File Information
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('photo', 'audio', 'document')),
    storage_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL, -- bytes
    mime_type VARCHAR(100),
    
    -- Basic Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Photo Intelligence (AI Analysis)
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    -- Structure defined in section 2.6
    
    -- User Context
    user_context JSONB DEFAULT '{}'::jsonb,
    -- Example:
    -- {
    --   "caption": "Family beach day, summer 1975",
    --   "people_in_photo": ["Mom", "Dad", "Me", "Sister"],
    --   "location": "Cape Cod, Massachusetts",
    --   "date_taken": "1975-07-15",
    --   "memory_text": "This was our annual summer trip..."
    -- }
    
    -- Narrative Usage
    narrative_usage JSONB DEFAULT '{}'::jsonb,
    -- Example:
    -- {
    --   "chapters": ["uuid1"],
    --   "sections": ["childhood"],
    --   "placement": "full_page",
    --   "page_number": 23,
    --   "enhances_fragments": ["uuid1", "uuid2"]
    -- }
    
    -- Processing Status
    status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN (
        'uploaded', 'processing', 'analyzed', 'ready', 'used', 'archived', 'failed'
    )),
    processing_error TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_media_files_project_id ON media_files(project_id);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX idx_media_files_file_type ON media_files(file_type);
CREATE INDEX idx_media_files_status ON media_files(status);
CREATE INDEX idx_media_files_ai_analysis ON media_files USING GIN (ai_analysis);
CREATE INDEX idx_media_files_user_context ON media_files USING GIN (user_context);

-- Trigger for updated_at
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2.6 Photo Intelligence Metadata Structure

Detailed structure for the `ai_analysis` JSONB field in `media_files`:

```json
{
  "analysis_version": "1.0",
  "analyzed_at": "2025-12-19T18:00:00Z",
  "model": "gpt-4-vision",
  "confidence_score": 0.92,
  
  "people_detected": [
    {
      "position": "center",
      "bounding_box": {"x": 100, "y": 50, "width": 200, "height": 300},
      "estimated_age": "30-35",
      "gender": "female",
      "description": "Dark curly hair worn in soft waves, warm smile, floral sundress with yellow daisies",
      "facial_expression": "joyful, relaxed",
      "body_language": "open, welcoming",
      "user_identified_as": "mother",
      "confidence": 0.95
    }
  ],
  
  "setting": {
    "type": "outdoor",
    "location_type": "beach",
    "specific_location": "sandy beach with ocean in background",
    "time_period": "1970s",
    "time_period_indicators": ["clothing style", "photo quality", "color palette"],
    "season": "summer",
    "weather": "sunny, clear",
    "time_of_day": "midday",
    "lighting": "bright natural light",
    "confidence": 0.88
  },
  
  "objects": [
    {"name": "beach umbrella", "color": "blue and white striped", "position": "background"},
    {"name": "picnic basket", "material": "wicker", "position": "foreground"},
    {"name": "vintage camera", "type": "Polaroid", "position": "on blanket"}
  ],
  
  "composition": {
    "photo_type": "candid",
    "framing": "medium shot",
    "focus": "sharp on people, soft background",
    "quality": "vintage, slightly faded colors",
    "orientation": "landscape"
  },
  
  "emotional_tone": {
    "primary": "joyful",
    "secondary": ["relaxed", "nostalgic"],
    "mood_indicators": ["genuine smiles", "relaxed postures", "casual setting"],
    "overall_sentiment": "positive",
    "confidence": 0.90
  },
  
  "narrative_elements": {
    "story_potential": "high",
    "suggested_themes": ["family bonding", "summer traditions", "simple pleasures"],
    "sensory_opportunities": ["sound of waves", "warmth of sun", "smell of salt air"],
    "temporal_markers": ["annual trip", "childhood memory", "1970s era"]
  },
  
  "enhancement_suggestions": [
    "Describe the sound of the waves in the background",
    "What was the temperature like that day?",
    "What did the sand feel like between your toes?",
    "What were you talking about when this photo was taken?"
  ]
}
```

### 2.7 New Table: `section_synthesis`

Tracks chapter preview generation and quality feedback.

```sql
CREATE TABLE section_synthesis (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES memoir_sections(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Synthesis Content
    preview_content TEXT,
    preview_word_count INTEGER,
    
    -- Source Fragments
    fragment_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    photo_ids UUID[] DEFAULT ARRAY[]::UUID[],
    
    -- Quality Assessment
    quality_score FLOAT CHECK (quality_score BETWEEN 0 AND 1),
    quality_checks JSONB DEFAULT '{}'::jsonb,
    -- Example:
    -- {
    --   "sensory_richness": {"score": 0.85, "passed": true},
    --   "emotional_depth": {"score": 0.78, "passed": true},
    --   "narrative_flow": {"score": 0.92, "passed": true},
    --   "photo_integration": {"score": 0.88, "passed": true}
    -- }
    
    -- Follow-up Recommendations
    recommendations JSONB DEFAULT '[]'::jsonb,
    -- Example:
    -- [
    --   {
    --     "type": "add_detail",
    --     "priority": "medium",
    --     "message": "Add more sensory details about the house",
    --     "suggested_prompt": "What did the house smell like?"
    --   }
    -- ]
    
    -- User Feedback
    user_approved BOOLEAN DEFAULT FALSE,
    user_feedback TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Generation Metadata
    generation_model VARCHAR(100),
    generation_parameters JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_section_synthesis_section_id ON section_synthesis(section_id);
CREATE INDEX idx_section_synthesis_project_id ON section_synthesis(project_id);
CREATE INDEX idx_section_synthesis_approved ON section_synthesis(user_approved);
CREATE INDEX idx_section_synthesis_quality ON section_synthesis(quality_score);

-- Trigger for updated_at
CREATE TRIGGER update_section_synthesis_updated_at
    BEFORE UPDATE ON section_synthesis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 3. SQL Migration Scripts

### 3.1 Migration 001: Create Helper Function

```sql
-- Migration: 001_create_helper_functions.sql
-- Description: Create helper functions for triggers and utilities

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN array_length(regexp_split_to_array(trim(text_content), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check section unlock eligibility
CREATE OR REPLACE FUNCTION check_section_unlock_eligibility(
    p_project_id UUID,
    p_section_order INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    previous_section_completed BOOLEAN;
BEGIN
    -- First section is always unlockable
    IF p_section_order = 1 THEN
        RETURN TRUE;
    END IF;
    
    -- Check if previous section is completed
    SELECT is_completed INTO previous_section_completed
    FROM memoir_sections
    WHERE project_id = p_project_id
    AND section_order = p_section_order - 1;
    
    RETURN COALESCE(previous_section_completed, FALSE);
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Migration 002: Create User Profiles Table

```sql
-- Migration: 002_create_user_profiles.sql
-- Description: Create user_profiles table for ghostwriter questionnaire

-- Create user_profiles table (full SQL from section 2.1)
-- [Include complete CREATE TABLE statement from 2.1]

-- Create indexes (from section 2.1)
-- [Include all CREATE INDEX statements from 2.1]

-- Create trigger
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (see section 5.1)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### 3.3 Migration 003: Create Memoir Sections Tables

```sql
-- Migration: 003_create_memoir_sections.sql
-- Description: Create memoir_sections and section_prompts tables

-- Create memoir_sections table (full SQL from section 2.2)
-- [Include complete CREATE TABLE statement from 2.2]

-- Create section_prompts table (full SQL from section 2.3)
-- [Include complete CREATE TABLE statement from 2.3]

-- Create indexes
-- [Include all CREATE INDEX statements from 2.2 and 2.3]

-- Create triggers
CREATE TRIGGER update_memoir_sections_updated_at
    BEFORE UPDATE ON memoir_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_section_prompts_updated_at
    BEFORE UPDATE ON section_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE memoir_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_prompts ENABLE ROW LEVEL SECURITY;
```

### 3.4 Migration 004: Extend Memory Fragments Table

```sql
-- Migration: 004_extend_memory_fragments.sql
-- Description: Add ghostwriter workflow columns to memory_fragments

-- Add new columns (from section 2.4)
ALTER TABLE memory_fragments
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES memoir_sections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS prompt_id UUID REFERENCES section_prompts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS photo_id UUID REFERENCES media_files(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ai_enhanced_content TEXT,
ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(50) DEFAULT 'included' 
    CHECK (privacy_level IN ('included', 'private_notes', 'excluded')),
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS sensory_richness_score FLOAT 
    CHECK (sensory_richness_score BETWEEN 0 AND 1),
ADD COLUMN IF NOT EXISTS emotional_depth_score FLOAT 
    CHECK (emotional_depth_score BETWEEN 0 AND 1);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_memory_fragments_section_id 
    ON memory_fragments(section_id);
CREATE INDEX IF NOT EXISTS idx_memory_fragments_prompt_id 
    ON memory_fragments(prompt_id);
CREATE INDEX IF NOT EXISTS idx_memory_fragments_photo_id 
    ON memory_fragments(photo_id);
CREATE INDEX IF NOT EXISTS idx_memory_fragments_privacy 
    ON memory_fragments(privacy_level);
CREATE INDEX IF NOT EXISTS idx_memory_fragments_quality 
    ON memory_fragments(sensory_richness_score, emotional_depth_score);

-- Add trigger to auto-calculate word count
CREATE OR REPLACE FUNCTION update_memory_fragment_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_content IS NOT NULL THEN
        NEW.word_count = calculate_word_count(NEW.raw_content);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memory_fragments_word_count_trigger
    BEFORE INSERT OR UPDATE OF raw_content ON memory_fragments
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_fragment_word_count();
```

### 3.5 Migration 005: Create/Extend Media Files Table

```sql
-- Migration: 005_create_media_files.sql
-- Description: Create or extend media_files table for photo intelligence

-- Create media_files table if it doesn't exist (from section 2.5)
-- [Include complete CREATE TABLE IF NOT EXISTS statement from 2.5]

-- If table exists, add new columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'media_files') THEN
        
        -- Add ai_analysis column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'media_files' 
                      AND column_name = 'ai_analysis') THEN
            ALTER TABLE media_files ADD COLUMN ai_analysis JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add user_context column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'media_files' 
                      AND column_name = 'user_context') THEN
            ALTER TABLE media_files ADD COLUMN user_context JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add narrative_usage column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'media_files' 
                      AND column_name = 'narrative_usage') THEN
            ALTER TABLE media_files ADD COLUMN narrative_usage JSONB DEFAULT '{}'::jsonb;
        END IF;
        
        -- Add analyzed_at column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'media_files' 
                      AND column_name = 'analyzed_at') THEN
            ALTER TABLE media_files ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;
        END IF;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_media_files_ai_analysis 
    ON media_files USING GIN (ai_analysis);
CREATE INDEX IF NOT EXISTS idx_media_files_user_context 
    ON media_files USING GIN (user_context);

-- Add RLS policies
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
```

### 3.6 Migration 006: Create Section Synthesis Table

```sql
-- Migration: 006_create_section_synthesis.sql
-- Description:
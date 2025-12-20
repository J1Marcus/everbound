-- Migration: 002_create_memoir_sections.sql
-- Description: Create memoir_sections table for personalized chapter roadmap
-- Dependencies: Requires projects table to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Create memoir_sections table
CREATE TABLE IF NOT EXISTS memoir_sections (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memoir_sections_project_id ON memoir_sections(project_id);
CREATE INDEX IF NOT EXISTS idx_memoir_sections_order ON memoir_sections(project_id, section_order);
CREATE INDEX IF NOT EXISTS idx_memoir_sections_unlocked ON memoir_sections(project_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_memoir_sections_completed ON memoir_sections(project_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_memoir_sections_conditional ON memoir_sections(is_conditional, condition_key);
CREATE INDEX IF NOT EXISTS idx_memoir_sections_prompts ON memoir_sections USING GIN (prompts);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_memoir_sections_updated_at ON memoir_sections;
CREATE TRIGGER update_memoir_sections_updated_at
    BEFORE UPDATE ON memoir_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE memoir_sections ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE memoir_sections IS 'Defines personalized chapter roadmap and tracks progress through memoir sections';
COMMENT ON COLUMN memoir_sections.section_key IS 'Unique identifier for section type (e.g., origins, childhood)';
COMMENT ON COLUMN memoir_sections.prompts IS 'JSONB array of scene-based prompts for this section';
COMMENT ON COLUMN memoir_sections.is_conditional IS 'Whether section visibility depends on user profile';
COMMENT ON COLUMN memoir_sections.condition_key IS 'Profile field that controls section visibility';
COMMENT ON COLUMN memoir_sections.quality_score IS 'Overall quality score for section content (0-1)';

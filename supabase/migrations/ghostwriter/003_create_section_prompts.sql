-- Migration: 003_create_section_prompts.sql
-- Description: Create section_prompts table for normalized prompt storage
-- Dependencies: Requires memoir_sections and projects tables to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Create section_prompts table
CREATE TABLE IF NOT EXISTS section_prompts (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_prompts_section_id ON section_prompts(section_id);
CREATE INDEX IF NOT EXISTS idx_section_prompts_project_id ON section_prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_section_prompts_order ON section_prompts(section_id, prompt_order);
CREATE INDEX IF NOT EXISTS idx_section_prompts_completed ON section_prompts(section_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_section_prompts_sensitivity ON section_prompts(sensitivity_tier);
CREATE INDEX IF NOT EXISTS idx_section_prompts_type ON section_prompts(prompt_type);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_section_prompts_updated_at ON section_prompts;
CREATE TRIGGER update_section_prompts_updated_at
    BEFORE UPDATE ON section_prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE section_prompts ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE section_prompts IS 'Normalized storage for scene-based prompts with sensitivity tiers';
COMMENT ON COLUMN section_prompts.prompt_type IS 'Type of prompt: scene, people, tension, change, meaning, sensory, reflection, photo_context';
COMMENT ON COLUMN section_prompts.sensitivity_tier IS 'Privacy sensitivity level (1=general, 4=highly personal)';
COMMENT ON COLUMN section_prompts.requires_comfort_flag IS 'User profile comfort flag required to show this prompt';
COMMENT ON COLUMN section_prompts.privacy_default IS 'Default privacy level for responses to this prompt';
COMMENT ON COLUMN section_prompts.photo_encouraged IS 'Whether photo upload is encouraged for this prompt';

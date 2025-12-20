-- Migration: 004_create_section_synthesis.sql
-- Description: Create section_synthesis table for chapter preview generation
-- Dependencies: Requires memoir_sections and projects tables to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Create section_synthesis table
CREATE TABLE IF NOT EXISTS section_synthesis (
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_synthesis_section_id ON section_synthesis(section_id);
CREATE INDEX IF NOT EXISTS idx_section_synthesis_project_id ON section_synthesis(project_id);
CREATE INDEX IF NOT EXISTS idx_section_synthesis_approved ON section_synthesis(user_approved);
CREATE INDEX IF NOT EXISTS idx_section_synthesis_quality ON section_synthesis(quality_score);
CREATE INDEX IF NOT EXISTS idx_section_synthesis_created ON section_synthesis(created_at DESC);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_section_synthesis_updated_at ON section_synthesis;
CREATE TRIGGER update_section_synthesis_updated_at
    BEFORE UPDATE ON section_synthesis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE section_synthesis ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE section_synthesis IS 'Tracks chapter preview generation and quality feedback for memoir sections';
COMMENT ON COLUMN section_synthesis.preview_content IS 'AI-generated chapter preview text';
COMMENT ON COLUMN section_synthesis.fragment_ids IS 'Array of memory fragment UUIDs used in synthesis';
COMMENT ON COLUMN section_synthesis.photo_ids IS 'Array of photo UUIDs integrated into preview';
COMMENT ON COLUMN section_synthesis.quality_checks IS 'JSONB object with quality metrics and pass/fail status';
COMMENT ON COLUMN section_synthesis.recommendations IS 'JSONB array of follow-up suggestions to improve quality';
COMMENT ON COLUMN section_synthesis.generation_model IS 'AI model used for synthesis (e.g., gpt-4, claude-3)';

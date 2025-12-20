-- Migration: 005_extend_memory_fragments.sql
-- Description: Add ghostwriter workflow columns to memory_fragments table
-- Dependencies: Requires memory_fragments, memoir_sections, section_prompts tables to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Add new columns to memory_fragments table
ALTER TABLE memory_fragments
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES memoir_sections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS prompt_id UUID REFERENCES section_prompts(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS photo_id UUID,
ADD COLUMN IF NOT EXISTS ai_enhanced_content TEXT,
ADD COLUMN IF NOT EXISTS privacy_level VARCHAR(50) DEFAULT 'included' 
    CHECK (privacy_level IN ('included', 'private_notes', 'excluded')),
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS sensory_richness_score FLOAT 
    CHECK (sensory_richness_score IS NULL OR (sensory_richness_score BETWEEN 0 AND 1)),
ADD COLUMN IF NOT EXISTS emotional_depth_score FLOAT 
    CHECK (emotional_depth_score IS NULL OR (emotional_depth_score BETWEEN 0 AND 1));

-- Create indexes for new columns
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

-- Create helper function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count(text_content TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF text_content IS NULL OR trim(text_content) = '' THEN
        RETURN 0;
    END IF;
    RETURN array_length(regexp_split_to_array(trim(text_content), '\s+'), 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger function to auto-calculate word count
CREATE OR REPLACE FUNCTION update_memory_fragment_word_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_content IS NOT NULL THEN
        NEW.word_count = calculate_word_count(NEW.raw_content);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for word count calculation
DROP TRIGGER IF EXISTS memory_fragments_word_count_trigger ON memory_fragments;
CREATE TRIGGER memory_fragments_word_count_trigger
    BEFORE INSERT OR UPDATE OF raw_content ON memory_fragments
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_fragment_word_count();

-- Update existing rows to calculate word count
UPDATE memory_fragments
SET word_count = calculate_word_count(raw_content)
WHERE word_count IS NULL AND raw_content IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN memory_fragments.section_id IS 'Links fragment to a specific memoir section';
COMMENT ON COLUMN memory_fragments.prompt_id IS 'Links fragment to the prompt that generated it';
COMMENT ON COLUMN memory_fragments.photo_id IS 'Links fragment to an associated photo';
COMMENT ON COLUMN memory_fragments.ai_enhanced_content IS 'AI-enhanced version with photo intelligence and sensory details';
COMMENT ON COLUMN memory_fragments.privacy_level IS 'User privacy preference: included, private_notes, or excluded';
COMMENT ON COLUMN memory_fragments.word_count IS 'Automatically calculated word count of raw_content';
COMMENT ON COLUMN memory_fragments.sensory_richness_score IS 'AI-calculated score for sensory detail richness (0-1)';
COMMENT ON COLUMN memory_fragments.emotional_depth_score IS 'AI-calculated score for emotional depth (0-1)';

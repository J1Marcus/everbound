-- Migration: 007_create_indexes.sql
-- Description: Create additional performance indexes for ghostwriter workflow
-- Dependencies: All previous migrations must be applied
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Additional composite indexes for common query patterns

-- User profiles: Find profiles by completion status and project
CREATE INDEX IF NOT EXISTS idx_user_profiles_project_completed 
    ON user_profiles(project_id, profile_completed);

-- Memoir sections: Find unlocked sections in order
CREATE INDEX IF NOT EXISTS idx_memoir_sections_unlocked_order 
    ON memoir_sections(project_id, is_unlocked, section_order) 
    WHERE is_unlocked = TRUE;

-- Memoir sections: Find completed sections
CREATE INDEX IF NOT EXISTS idx_memoir_sections_completed_order 
    ON memoir_sections(project_id, is_completed, section_order) 
    WHERE is_completed = TRUE;

-- Section prompts: Find incomplete prompts for a section
CREATE INDEX IF NOT EXISTS idx_section_prompts_incomplete 
    ON section_prompts(section_id, is_completed, prompt_order) 
    WHERE is_completed = FALSE;

-- Memory fragments: Find fragments by section and status
CREATE INDEX IF NOT EXISTS idx_memory_fragments_section_status 
    ON memory_fragments(section_id, status);

-- Memory fragments: Find fragments with photos
CREATE INDEX IF NOT EXISTS idx_memory_fragments_with_photos 
    ON memory_fragments(project_id, photo_id) 
    WHERE photo_id IS NOT NULL;

-- Memory fragments: Find high-quality fragments
CREATE INDEX IF NOT EXISTS idx_memory_fragments_high_quality 
    ON memory_fragments(section_id, sensory_richness_score, emotional_depth_score) 
    WHERE sensory_richness_score > 0.7 OR emotional_depth_score > 0.7;

-- Media files: Find photos ready for use
CREATE INDEX IF NOT EXISTS idx_media_files_photos_ready 
    ON media_files(project_id, file_type, status) 
    WHERE file_type = 'photo' AND status IN ('analyzed', 'ready');

-- Media files: Find recently analyzed photos
CREATE INDEX IF NOT EXISTS idx_media_files_analyzed_recent 
    ON media_files(project_id, analyzed_at DESC) 
    WHERE analyzed_at IS NOT NULL;

-- Section synthesis: Find latest synthesis per section
CREATE INDEX IF NOT EXISTS idx_section_synthesis_latest 
    ON section_synthesis(section_id, created_at DESC);

-- Section synthesis: Find approved syntheses
CREATE INDEX IF NOT EXISTS idx_section_synthesis_approved_sections 
    ON section_synthesis(project_id, user_approved) 
    WHERE user_approved = TRUE;

-- Create helper function to check section unlock eligibility
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
$$ LANGUAGE plpgsql STABLE;

-- Create helper function to get section progress
CREATE OR REPLACE FUNCTION get_section_progress(p_section_id UUID)
RETURNS TABLE (
    section_id UUID,
    required_memories INTEGER,
    collected_memories INTEGER,
    target_word_count INTEGER,
    current_word_count INTEGER,
    completion_percentage FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.id,
        ms.required_memories,
        COUNT(mf.id)::INTEGER as collected_memories,
        ms.target_word_count,
        COALESCE(SUM(mf.word_count), 0)::INTEGER as current_word_count,
        CASE 
            WHEN ms.required_memories > 0 THEN
                LEAST(100.0, (COUNT(mf.id)::FLOAT / ms.required_memories::FLOAT) * 100.0)
            ELSE 0.0
        END as completion_percentage
    FROM memoir_sections ms
    LEFT JOIN memory_fragments mf ON mf.section_id = ms.id
    WHERE ms.id = p_section_id
    GROUP BY ms.id, ms.required_memories, ms.target_word_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create helper function to get project overview
CREATE OR REPLACE FUNCTION get_project_ghostwriter_overview(p_project_id UUID)
RETURNS TABLE (
    total_sections INTEGER,
    unlocked_sections INTEGER,
    completed_sections INTEGER,
    total_fragments INTEGER,
    total_words INTEGER,
    photos_uploaded INTEGER,
    photos_analyzed INTEGER,
    profile_completed BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ms.id)::INTEGER as total_sections,
        COUNT(DISTINCT ms.id) FILTER (WHERE ms.is_unlocked)::INTEGER as unlocked_sections,
        COUNT(DISTINCT ms.id) FILTER (WHERE ms.is_completed)::INTEGER as completed_sections,
        COUNT(DISTINCT mf.id)::INTEGER as total_fragments,
        COALESCE(SUM(mf.word_count), 0)::INTEGER as total_words,
        COUNT(DISTINCT media.id) FILTER (WHERE media.file_type = 'photo')::INTEGER as photos_uploaded,
        COUNT(DISTINCT media.id) FILTER (WHERE media.file_type = 'photo' AND media.status IN ('analyzed', 'ready'))::INTEGER as photos_analyzed,
        COALESCE(up.profile_completed, FALSE) as profile_completed
    FROM projects p
    LEFT JOIN memoir_sections ms ON ms.project_id = p.id
    LEFT JOIN memory_fragments mf ON mf.project_id = p.id
    LEFT JOIN media_files media ON media.project_id = p.id
    LEFT JOIN user_profiles up ON up.project_id = p.id
    WHERE p.id = p_project_id
    GROUP BY p.id, up.profile_completed;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comments for documentation
COMMENT ON FUNCTION check_section_unlock_eligibility IS 'Checks if a section can be unlocked based on previous section completion';
COMMENT ON FUNCTION get_section_progress IS 'Returns detailed progress metrics for a memoir section';
COMMENT ON FUNCTION get_project_ghostwriter_overview IS 'Returns comprehensive overview of ghostwriter workflow progress for a project';

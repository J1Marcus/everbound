-- Migration: 009_seed_data.sql
-- Description: Seed default memoir sections and initialize project sections
-- Dependencies: All previous migrations must be applied
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- ============================================================================
-- SECTION INITIALIZATION FUNCTION
-- ============================================================================

-- Function to initialize memoir sections for a project
CREATE OR REPLACE FUNCTION initialize_memoir_sections(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if sections already exist for this project
    IF EXISTS (SELECT 1 FROM memoir_sections WHERE project_id = p_project_id) THEN
        RETURN;
    END IF;
    
    -- Core Section 1: Origins (Always unlocked)
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'origins', 'Origins', 
        'Your birth, family background, and early home',
        1, TRUE, TRUE, 5, 2000
    );
    
    -- Core Section 2: Childhood
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'childhood', 'Childhood', 
        'School, friends, routines, early joys and fears',
        2, TRUE, FALSE, 6, 2500
    );
    
    -- Core Section 3: Teen Years
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'teen_years', 'Teen Years', 
        'Identity, rebellion, passions, formative moments',
        3, TRUE, FALSE, 5, 2000
    );
    
    -- Core Section 4: Early Adulthood
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'early_adulthood', 'Early Adulthood', 
        'Leaving home, first independence, early work',
        4, TRUE, FALSE, 5, 2000
    );
    
    -- Core Section 5: Work & Purpose
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'work_purpose', 'Work & Purpose', 
        'Career arcs, proud moments, failures, lessons',
        5, TRUE, FALSE, 6, 2500
    );
    
    -- Core Section 6: Relationships & Family
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'relationships_family', 'Relationships & Family', 
        'Love, partnership, children, family bonds',
        6, TRUE, FALSE, 6, 2500
    );
    
    -- Core Section 7: Values & Beliefs
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'values_beliefs', 'Values & Beliefs', 
        'What mattered, what changed, why',
        7, TRUE, FALSE, 4, 1500
    );
    
    -- Core Section 8: Hobbies & Joy
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'hobbies_joy', 'Hobbies & Joy', 
        'Sports, music, books, travel, things that made life feel alive',
        8, TRUE, FALSE, 5, 2000
    );
    
    -- Core Section 9: Milestones & Turning Points
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'milestones', 'Milestones & Turning Points', 
        'Moves, losses, wins, surprises',
        9, TRUE, FALSE, 6, 2500
    );
    
    -- Core Section 10: Lessons & Legacy
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'lessons_legacy', 'Lessons & Legacy', 
        'Advice, regrets, gratitude, what you hope they remember',
        10, TRUE, FALSE, 5, 2000
    );
    
    -- Conditional Section: Military Service (shown if military_service = true)
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_conditional, condition_key, condition_value,
        is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'military_service', 'Military Service', 
        'Your time in service, experiences, and impact',
        11, FALSE, TRUE, 'military_service', TRUE,
        FALSE, 5, 2000
    );
    
    -- Conditional Section: Faith Journey (shown if faith_important = true)
    INSERT INTO memoir_sections (
        project_id, section_key, section_title, section_description,
        section_order, is_core, is_conditional, condition_key, condition_value,
        is_unlocked, required_memories, target_word_count
    ) VALUES (
        p_project_id, 'faith_journey', 'Faith Journey', 
        'Your spiritual path, beliefs, and how they shaped you',
        12, FALSE, TRUE, 'faith_important', TRUE,
        FALSE, 4, 1500
    );
    
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGER TO AUTO-INITIALIZE SECTIONS
-- ============================================================================

-- Trigger function to initialize sections when project is created
CREATE OR REPLACE FUNCTION trigger_initialize_memoir_sections()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize sections for new project
    PERFORM initialize_memoir_sections(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on projects table
DROP TRIGGER IF EXISTS on_project_create_initialize_sections ON projects;
CREATE TRIGGER on_project_create_initialize_sections
    AFTER INSERT ON projects
    FOR EACH ROW
    EXECUTE FUNCTION trigger_initialize_memoir_sections();

-- ============================================================================
-- SAMPLE PROMPTS FOR ORIGINS SECTION
-- ============================================================================

-- Function to seed sample prompts for a section
CREATE OR REPLACE FUNCTION seed_origins_prompts(p_section_id UUID, p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Prompt 1: The House
    INSERT INTO section_prompts (
        section_id, project_id, prompt_key, prompt_order, prompt_type,
        question, guidance, target_word_count, sensitivity_tier,
        photo_encouraged, photo_prompt
    ) VALUES (
        p_section_id, p_project_id, 'origins_house_001', 1, 'scene',
        'Take me to the house where you were born or spent your earliest years. What do you see?',
        'Describe the physical space: colors, textures, sounds, smells. Was it an apartment, a farmhouse, a suburban home? What made it feel like home?',
        200, 1, TRUE,
        'Upload a photo of your childhood home if you have one'
    );
    
    -- Prompt 2: Family Atmosphere
    INSERT INTO section_prompts (
        section_id, project_id, prompt_key, prompt_order, prompt_type,
        question, guidance, target_word_count, sensitivity_tier,
        photo_encouraged
    ) VALUES (
        p_section_id, p_project_id, 'origins_family_002', 2, 'people',
        'Who raised you? Describe the people who shaped your earliest years.',
        'Think about their personalities, their routines, how they showed love or discipline. What was the emotional atmosphere of your home?',
        250, 2, TRUE
    );
    
    -- Prompt 3: First Memory
    INSERT INTO section_prompts (
        section_id, project_id, prompt_key, prompt_order, prompt_type,
        question, guidance, target_word_count, sensitivity_tier,
        photo_encouraged
    ) VALUES (
        p_section_id, p_project_id, 'origins_memory_003', 3, 'sensory',
        'What is your very first memory? Take me there.',
        'Don''t worry if it''s fragmented or unclear. Describe what you see, hear, feel. How old were you? What emotions come with this memory?',
        200, 1, FALSE
    );
    
    -- Prompt 4: Family Stories
    INSERT INTO section_prompts (
        section_id, project_id, prompt_key, prompt_order, prompt_type,
        question, guidance, target_word_count, sensitivity_tier,
        photo_encouraged
    ) VALUES (
        p_section_id, p_project_id, 'origins_stories_004', 4, 'meaning',
        'What stories were told about your birth or early childhood?',
        'Family legends, funny anecdotes, or significant events. What did these stories reveal about your family''s values or sense of humor?',
        200, 1, TRUE
    );
    
    -- Prompt 5: Neighborhood/Community
    INSERT INTO section_prompts (
        section_id, project_id, prompt_key, prompt_order, prompt_type,
        question, guidance, target_word_count, sensitivity_tier,
        photo_encouraged
    ) VALUES (
        p_section_id, p_project_id, 'origins_community_005', 5, 'scene',
        'Describe the neighborhood or community where you grew up.',
        'What was the landscape like? Who were the neighbors? What sounds, smells, or sights defined this place? Did you feel safe, adventurous, confined?',
        250, 1, TRUE
    );
    
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION HELPER FUNCTION
-- ============================================================================

-- Function to migrate existing projects to ghostwriter workflow
CREATE OR REPLACE FUNCTION migrate_project_to_ghostwriter(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Check if already migrated
    IF EXISTS (SELECT 1 FROM memoir_sections WHERE project_id = p_project_id) THEN
        RETURN;
    END IF;
    
    -- Initialize sections
    PERFORM initialize_memoir_sections(p_project_id);
    
    -- Try to assign existing fragments to sections based on tags or metadata
    -- This is a best-effort migration
    UPDATE memory_fragments mf
    SET section_id = (
        SELECT ms.id FROM memoir_sections ms
        WHERE ms.project_id = p_project_id
        AND ms.section_key = CASE
            -- Try to match based on tags if they exist
            WHEN mf.tags->>'life_stage' = 'childhood' THEN 'childhood'
            WHEN mf.tags->>'life_stage' = 'teen' THEN 'teen_years'
            WHEN mf.tags->>'life_stage' = 'adult' THEN 'early_adulthood'
            WHEN mf.tags->>'category' = 'work' THEN 'work_purpose'
            WHEN mf.tags->>'category' = 'family' THEN 'relationships_family'
            -- Default to origins for unclassified
            ELSE 'origins'
        END
        LIMIT 1
    )
    WHERE mf.project_id = p_project_id
    AND mf.section_id IS NULL;
    
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION initialize_memoir_sections IS 'Creates default memoir sections for a new project';
COMMENT ON FUNCTION seed_origins_prompts IS 'Seeds sample prompts for the Origins section';
COMMENT ON FUNCTION migrate_project_to_ghostwriter IS 'Migrates existing project to ghostwriter workflow';
COMMENT ON TRIGGER on_project_create_initialize_sections ON projects IS 'Automatically initializes memoir sections when a project is created';

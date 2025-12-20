-- Migration: 010_add_mock_synthesis_data.sql
-- Description: Add mock synthesis data for chapter 1 (Origins section) for testing
-- Dependencies: Requires section_synthesis, memoir_sections, and memory_fragments tables
-- Author: Digital Memoir Platform
-- Date: 2025-12-20

-- This migration adds realistic mock data for a completed "Origins" section
-- to enable testing of the synthesis/chapter preview functionality

-- Note: This assumes you have a project with sections already created
-- You'll need to replace the UUIDs with actual IDs from your database

-- Example: Insert mock synthesis for "Origins" section (Chapter 1)
-- Replace these UUIDs with actual values from your database:
-- - section_id: The UUID of the "Origins" memoir_section
-- - project_id: The UUID of your test project
-- - fragment_ids: UUIDs of memory fragments used in synthesis

DO $$
DECLARE
    v_project_id UUID;
    v_section_id UUID;
    v_fragment_id_1 UUID := gen_random_uuid();
    v_fragment_id_2 UUID := gen_random_uuid();
    v_fragment_id_3 UUID := gen_random_uuid();
    v_synthesis_id UUID;
BEGIN
    -- Get the first available project (or create a test one)
    SELECT id INTO v_project_id FROM projects LIMIT 1;
    
    -- If no project exists, you'll need to create one first
    IF v_project_id IS NULL THEN
        RAISE NOTICE 'No project found. Please create a project first.';
        RETURN;
    END IF;
    
    -- Get or create the Origins section
    SELECT id INTO v_section_id 
    FROM memoir_sections 
    WHERE project_id = v_project_id 
    AND section_key = 'origins'
    LIMIT 1;
    
    -- If Origins section doesn't exist, create it
    IF v_section_id IS NULL THEN
        INSERT INTO memoir_sections (
            project_id,
            section_key,
            section_title,
            section_description,
            section_order,
            is_core,
            is_unlocked,
            is_completed,
            required_memories,
            collected_memories,
            target_word_count,
            current_word_count,
            quality_score,
            completed_at
        ) VALUES (
            v_project_id,
            'origins',
            'Origins',
            'Where your story begins - the place, the people, and the world you were born into',
            1,
            true,
            true,
            true,
            5,
            5,
            2000,
            2150,
            0.92,
            NOW() - INTERVAL '1 day'
        ) RETURNING id INTO v_section_id;
        
        RAISE NOTICE 'Created Origins section with ID: %', v_section_id;
    ELSE
        -- Update existing section to mark as completed
        UPDATE memoir_sections
        SET is_completed = true,
            collected_memories = 5,
            current_word_count = 2150,
            quality_score = 0.92,
            completed_at = NOW() - INTERVAL '1 day'
        WHERE id = v_section_id;
        
        RAISE NOTICE 'Updated existing Origins section with ID: %', v_section_id;
    END IF;
    
    -- Create mock memory fragments if they don't exist
    INSERT INTO memory_fragments (
        id,
        project_id,
        narrator_id,
        input_type,
        raw_content,
        processed_content,
        word_count,
        status,
        tags,
        metadata,
        created_at
    ) VALUES 
    (
        v_fragment_id_1,
        v_project_id,
        (SELECT owner_id FROM projects WHERE id = v_project_id),
        'text',
        'I was born in a small brick house on Maple Street in 1952. The house had a green door that my mother painted every spring. I remember the smell of fresh paint mixing with the scent of her rose bushes that lined the front walk. My father built those flower beds himself, working every evening after his shift at the factory.',
        'I was born in a small brick house on Maple Street in 1952. The house had a green door that my mother painted every spring. I remember the smell of fresh paint mixing with the scent of her rose bushes that lined the front walk. My father built those flower beds himself, working every evening after his shift at the factory.',
        72,
        'used',
        jsonb_build_object(
            'life_stage', 'origins',
            'themes', ARRAY['home', 'family', 'childhood'],
            'emotional_tone', 'nostalgic',
            'timeline_confidence', 'high'
        ),
        jsonb_build_object(
            'timeline_anchor', jsonb_build_object(
                'type', 'date',
                'value', '1952',
                'confidence', 'high'
            ),
            'location', 'Maple Street',
            'people_mentioned', ARRAY['mother', 'father'],
            'sensory_details', jsonb_build_object(
                'visual', ARRAY['brick house', 'green door', 'rose bushes'],
                'olfactory', ARRAY['fresh paint', 'roses']
            )
        ),
        NOW() - INTERVAL '5 days'
    ),
    (
        v_fragment_id_2,
        v_project_id,
        (SELECT owner_id FROM projects WHERE id = v_project_id),
        'text',
        'My mother was a quiet woman with strong hands. She worked as a seamstress from home, and I would fall asleep to the sound of her sewing machine humming in the next room. She made all my clothes until I was twelve. I remember her measuring tape always draped around her neck like a scarf.',
        'My mother was a quiet woman with strong hands. She worked as a seamstress from home, and I would fall asleep to the sound of her sewing machine humming in the next room. She made all my clothes until I was twelve. I remember her measuring tape always draped around her neck like a scarf.',
        65,
        'used',
        jsonb_build_object(
            'life_stage', 'origins',
            'themes', ARRAY['family', 'mother', 'childhood'],
            'emotional_tone', 'warm',
            'timeline_confidence', 'high'
        ),
        jsonb_build_object(
            'people_mentioned', ARRAY['mother'],
            'sensory_details', jsonb_build_object(
                'auditory', ARRAY['sewing machine humming'],
                'visual', ARRAY['measuring tape', 'strong hands']
            )
        ),
        NOW() - INTERVAL '4 days'
    ),
    (
        v_fragment_id_3,
        v_project_id,
        (SELECT owner_id FROM projects WHERE id = v_project_id),
        'text',
        'Dad worked at the steel mill for thirty years. He would come home with his lunch pail empty and his hands stained with grease. But he never complained. On Saturdays, he would take me fishing at Miller''s Pond. Those were the times he talked the most, teaching me about patience and the importance of being quiet when you need to think.',
        'Dad worked at the steel mill for thirty years. He would come home with his lunch pail empty and his hands stained with grease. But he never complained. On Saturdays, he would take me fishing at Miller''s Pond. Those were the times he talked the most, teaching me about patience and the importance of being quiet when you need to think.',
        78,
        'used',
        jsonb_build_object(
            'life_stage', 'origins',
            'themes', ARRAY['family', 'father', 'childhood', 'lessons'],
            'emotional_tone', 'reflective',
            'timeline_confidence', 'high'
        ),
        jsonb_build_object(
            'people_mentioned', ARRAY['father'],
            'location', 'Miller''s Pond',
            'sensory_details', jsonb_build_object(
                'visual', ARRAY['lunch pail', 'grease-stained hands'],
                'tactile', ARRAY['fishing']
            )
        ),
        NOW() - INTERVAL '3 days'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created mock memory fragments';
    
    -- Insert the synthesis preview
    INSERT INTO section_synthesis (
        section_id,
        project_id,
        preview_content,
        preview_word_count,
        fragment_ids,
        quality_score,
        quality_checks,
        recommendations,
        user_approved,
        generation_model,
        generation_parameters,
        created_at
    ) VALUES (
        v_section_id,
        v_project_id,
        E'# Chapter 1: Where It All Started

Looking back now, I can see how much that small brick house on Maple Street shaped who I would become. It wasn''t grand or remarkable to anyone else, but to me, it was the whole world.

I was born there in 1952, in the front bedroom where my mother had hung yellow curtains she''d sewn herself. The house had a green door that she painted every spring without fail. I can still smell that fresh paint mixing with the scent of her rose bushes that lined the front walk. My father had built those flower beds himself, working every evening after his shift at the factory, his hands still stained with the day''s work.

My mother was a quiet woman with strong hands—hands that could coax a garden to bloom or thread the finest needle. She worked as a seamstress from home, and I would fall asleep most nights to the gentle hum of her sewing machine in the next room. That sound became a lullaby to me. She made all my clothes until I was twelve, each stitch a small act of love I didn''t fully appreciate until much later. I remember her measuring tape always draped around her neck like a scarf, ready at a moment''s notice.

Dad worked at the steel mill for thirty years. Every evening he would come home with his lunch pail empty and his hands darkened with grease. But I never once heard him complain. He saved his words for what mattered. On Saturdays, he would take me fishing at Miller''s Pond, and those were the times he talked the most. Sitting on that bank with our lines in the water, he taught me about patience, about the importance of being quiet when you need to think, about how sometimes the best thing you can do is just be present.

That house, those people, that life—it was simple, but it was solid. It gave me roots I didn''t know I was growing until years later when I needed them most. The green door, the sewing machine''s hum, the Saturday mornings at the pond—these weren''t just memories. They were the foundation of everything that came after.',
        2150,
        ARRAY[v_fragment_id_1, v_fragment_id_2, v_fragment_id_3],
        0.92,
        jsonb_build_object(
            'sensory_richness', jsonb_build_object(
                'score', 0.95,
                'passed', true,
                'details', 'Excellent use of sensory details: visual (green door, yellow curtains), auditory (sewing machine hum), olfactory (paint, roses)'
            ),
            'emotional_depth', jsonb_build_object(
                'score', 0.88,
                'passed', true,
                'details', 'Strong emotional resonance with reflective framing and authentic sentiment'
            ),
            'narrative_flow', jsonb_build_object(
                'score', 0.94,
                'passed', true,
                'details', 'Smooth transitions between memories, good pacing, natural progression'
            ),
            'voice_consistency', jsonb_build_object(
                'score', 0.91,
                'passed', true,
                'details', 'Consistent warm, reflective tone throughout'
            ),
            'character_development', jsonb_build_object(
                'score', 0.89,
                'passed', true,
                'details', 'Parents well-characterized through specific details and actions'
            )
        ),
        jsonb_build_array(
            jsonb_build_object(
                'type', 'enhancement',
                'priority', 'low',
                'message', 'Consider adding a photo of the house or family from this era',
                'suggested_action', 'Upload a photo to enhance visual connection'
            ),
            jsonb_build_object(
                'type', 'expansion',
                'priority', 'low',
                'message', 'You could expand on siblings or other family members if relevant',
                'suggested_prompt', 'Did you have brothers or sisters? What were they like?'
            )
        ),
        true,
        'gpt-4-turbo',
        jsonb_build_object(
            'temperature', 0.7,
            'max_tokens', 3000,
            'prompt_version', 'v2.1',
            'voice_profile_applied', true
        ),
        NOW() - INTERVAL '1 day'
    ) RETURNING id INTO v_synthesis_id;
    
    RAISE NOTICE 'Created synthesis preview with ID: %', v_synthesis_id;
    RAISE NOTICE 'Mock data creation complete!';
    RAISE NOTICE 'Project ID: %', v_project_id;
    RAISE NOTICE 'Section ID: %', v_section_id;
    
END $$;

-- Add helpful comment
COMMENT ON TABLE section_synthesis IS 'Chapter preview synthesis - see migration 010 for mock data example';

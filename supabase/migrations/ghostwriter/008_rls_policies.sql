-- Migration: 008_rls_policies.sql
-- Description: Create Row-Level Security policies for ghostwriter tables
-- Dependencies: All previous migrations must be applied
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- ============================================================================
-- USER PROFILES POLICIES
-- ============================================================================

-- Users can view their own profiles
CREATE POLICY "Users can view own profiles"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own profiles
CREATE POLICY "Users can create own profiles"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profiles
CREATE POLICY "Users can update own profiles"
ON user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own profiles
CREATE POLICY "Users can delete own profiles"
ON user_profiles FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- MEMOIR SECTIONS POLICIES
-- ============================================================================

-- Users can view sections for their own projects
CREATE POLICY "Users can view own project sections"
ON memoir_sections FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = memoir_sections.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- Users can view sections for collaborated projects
CREATE POLICY "Collaborators can view project sections"
ON memoir_sections FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_collaborators.project_id = memoir_sections.project_id
        AND project_collaborators.user_id = auth.uid()
        AND project_collaborators.accepted_at IS NOT NULL
    )
);

-- Only project owners can update sections
CREATE POLICY "Owners can update sections"
ON memoir_sections FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = memoir_sections.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- System can insert sections (for auto-initialization)
CREATE POLICY "System can insert sections"
ON memoir_sections FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = memoir_sections.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- ============================================================================
-- SECTION PROMPTS POLICIES
-- ============================================================================

-- Users can view prompts for their sections
CREATE POLICY "Users can view own section prompts"
ON section_prompts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM memoir_sections ms
        JOIN projects p ON p.id = ms.project_id
        WHERE ms.id = section_prompts.section_id
        AND p.owner_id = auth.uid()
    )
);

-- Collaborators can view prompts
CREATE POLICY "Collaborators can view section prompts"
ON section_prompts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM memoir_sections ms
        JOIN project_collaborators pc ON pc.project_id = ms.project_id
        WHERE ms.id = section_prompts.section_id
        AND pc.user_id = auth.uid()
        AND pc.accepted_at IS NOT NULL
    )
);

-- Users can update prompt completion status
CREATE POLICY "Users can update prompt status"
ON section_prompts FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM memoir_sections ms
        JOIN projects p ON p.id = ms.project_id
        WHERE ms.id = section_prompts.section_id
        AND (p.owner_id = auth.uid() OR EXISTS (
            SELECT 1 FROM project_collaborators pc
            WHERE pc.project_id = p.id
            AND pc.user_id = auth.uid()
            AND pc.role IN ('narrator', 'contributor')
        ))
    )
);

-- ============================================================================
-- SECTION SYNTHESIS POLICIES
-- ============================================================================

-- Users can view synthesis for their sections
CREATE POLICY "Users can view own section synthesis"
ON section_synthesis FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = section_synthesis.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- Collaborators can view synthesis
CREATE POLICY "Collaborators can view section synthesis"
ON section_synthesis FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_collaborators.project_id = section_synthesis.project_id
        AND project_collaborators.user_id = auth.uid()
        AND project_collaborators.accepted_at IS NOT NULL
    )
);

-- Users can insert synthesis for their sections
CREATE POLICY "Users can create section synthesis"
ON section_synthesis FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = section_synthesis.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- Users can update their synthesis
CREATE POLICY "Users can update section synthesis"
ON section_synthesis FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = section_synthesis.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- ============================================================================
-- MEMORY FRAGMENTS POLICIES (Extended)
-- ============================================================================

-- Users respect privacy levels when viewing fragments
CREATE POLICY "Users respect privacy levels"
ON memory_fragments FOR SELECT
USING (
    -- Own fragments are always visible
    (narrator_id = auth.uid())
    OR
    -- Included fragments visible to project members
    (
        privacy_level = 'included'
        AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = memory_fragments.project_id
            AND (
                projects.owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM project_collaborators
                    WHERE project_collaborators.project_id = projects.id
                    AND project_collaborators.user_id = auth.uid()
                    AND project_collaborators.accepted_at IS NOT NULL
                )
            )
        )
    )
);

-- ============================================================================
-- MEDIA FILES POLICIES
-- ============================================================================

-- Users can view media for their projects
CREATE POLICY "Users can view own project media"
ON media_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = media_files.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- Collaborators can view media
CREATE POLICY "Collaborators can view project media"
ON media_files FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_collaborators.project_id = media_files.project_id
        AND project_collaborators.user_id = auth.uid()
        AND project_collaborators.accepted_at IS NOT NULL
    )
);

-- Users can upload media to their projects
CREATE POLICY "Users can upload media to own projects"
ON media_files FOR INSERT
WITH CHECK (
    auth.uid() = uploaded_by
    AND EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = media_files.project_id
        AND (
            projects.owner_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM project_collaborators
                WHERE project_collaborators.project_id = projects.id
                AND project_collaborators.user_id = auth.uid()
                AND project_collaborators.role IN ('narrator', 'contributor')
            )
        )
    )
);

-- Users can update their own uploaded media
CREATE POLICY "Users can update own media"
ON media_files FOR UPDATE
USING (uploaded_by = auth.uid());

-- Users can delete their own uploaded media
CREATE POLICY "Users can delete own media"
ON media_files FOR DELETE
USING (uploaded_by = auth.uid());

-- Project owners can delete any media in their projects
CREATE POLICY "Owners can delete project media"
ON media_files FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = media_files.project_id
        AND projects.owner_id = auth.uid()
    )
);

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if user has access to project
CREATE OR REPLACE FUNCTION user_has_project_access(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects
        WHERE id = p_project_id
        AND owner_id = p_user_id
    ) OR EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND accepted_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user can edit project content
CREATE OR REPLACE FUNCTION user_can_edit_project(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM projects
        WHERE id = p_project_id
        AND owner_id = p_user_id
    ) OR EXISTS (
        SELECT 1 FROM project_collaborators
        WHERE project_id = p_project_id
        AND user_id = p_user_id
        AND role IN ('narrator', 'contributor')
        AND accepted_at IS NOT NULL
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON POLICY "Users can view own profiles" ON user_profiles IS 'Users can only view their own profile data';
COMMENT ON POLICY "Users respect privacy levels" ON memory_fragments IS 'Enforces privacy_level field for fragment visibility';
COMMENT ON FUNCTION user_has_project_access IS 'Checks if user is owner or accepted collaborator';
COMMENT ON FUNCTION user_can_edit_project IS 'Checks if user has edit permissions (owner, narrator, or contributor)';

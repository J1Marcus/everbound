-- Migration: 006_extend_media_files.sql
-- Description: Create or extend media_files table for photo intelligence
-- Dependencies: Requires projects and users tables to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

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
    -- Structure: see GHOSTWRITER_ARCHITECTURE.md section 2.6
    
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

-- Add new columns if table already exists
DO $$
BEGIN
    -- Add ai_analysis column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'ai_analysis'
    ) THEN
        ALTER TABLE media_files ADD COLUMN ai_analysis JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add user_context column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'user_context'
    ) THEN
        ALTER TABLE media_files ADD COLUMN user_context JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add narrative_usage column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'narrative_usage'
    ) THEN
        ALTER TABLE media_files ADD COLUMN narrative_usage JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- Add analyzed_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'analyzed_at'
    ) THEN
        ALTER TABLE media_files ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'status'
    ) THEN
        ALTER TABLE media_files ADD COLUMN status VARCHAR(50) DEFAULT 'uploaded' 
            CHECK (status IN ('uploaded', 'processing', 'analyzed', 'ready', 'used', 'archived', 'failed'));
    END IF;
    
    -- Add processing_error column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'media_files' AND column_name = 'processing_error'
    ) THEN
        ALTER TABLE media_files ADD COLUMN processing_error TEXT;
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_project_id ON media_files(project_id);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_by ON media_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON media_files(status);
CREATE INDEX IF NOT EXISTS idx_media_files_ai_analysis ON media_files USING GIN (ai_analysis);
CREATE INDEX IF NOT EXISTS idx_media_files_user_context ON media_files USING GIN (user_context);
CREATE INDEX IF NOT EXISTS idx_media_files_narrative_usage ON media_files USING GIN (narrative_usage);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Add foreign key constraint for photo_id in memory_fragments if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'memory_fragments_photo_id_fkey'
    ) THEN
        ALTER TABLE memory_fragments
        ADD CONSTRAINT memory_fragments_photo_id_fkey
        FOREIGN KEY (photo_id) REFERENCES media_files(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE media_files IS 'Stores photos, audio, and documents with AI analysis metadata';
COMMENT ON COLUMN media_files.ai_analysis IS 'JSONB object containing GPT-4 Vision analysis results';
COMMENT ON COLUMN media_files.user_context IS 'JSONB object with user-provided context (caption, people, location, date)';
COMMENT ON COLUMN media_files.narrative_usage IS 'JSONB object tracking how photo is used in chapters and sections';
COMMENT ON COLUMN media_files.status IS 'Processing status: uploaded, processing, analyzed, ready, used, archived, failed';
COMMENT ON COLUMN media_files.analyzed_at IS 'Timestamp when AI analysis was completed';

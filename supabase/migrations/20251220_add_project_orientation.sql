-- Add orientation preferences to projects table
-- This stores the thoughtful conversation data from the project orientation flow

-- Add metadata column if it doesn't exist (JSONB for flexible storage)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create an index on metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_metadata ON projects USING gin(metadata);

-- Add helpful comment
COMMENT ON COLUMN projects.metadata IS 'Stores project-specific metadata including orientation preferences (audiences, openness level, sensitive topics, reader takeaway)';

-- Example of the metadata structure:
-- {
--   "orientation": {
--     "audiences": ["children", "grandchildren"],
--     "opennessLevel": "honest_thoughtful",
--     "sensitiveTopics": {
--       "loss_grief": "include_gently",
--       "family_conflict": "keep_private"
--     },
--     "readerTakeaway": "I hope they understand the values that guided my life..."
--   }
-- }

-- Migration: 001_create_user_profiles.sql
-- Description: Create user_profiles table for ghostwriter questionnaire
-- Dependencies: Requires users and projects tables to exist
-- Author: Digital Memoir Platform
-- Date: 2025-12-19

-- Create helper function for updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    -- Primary Keys
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Relationship & Family
    marital_status VARCHAR(50) CHECK (marital_status IN (
        'married', 'partnered', 'previously_married', 
        'previously_partnered', 'never_married', 'prefer_not_to_say'
    )),
    has_children BOOLEAN DEFAULT FALSE,
    has_siblings BOOLEAN DEFAULT FALSE,
    raised_by VARCHAR(100) CHECK (raised_by IN (
        'both_parents', 'single_parent', 'grandparents', 
        'other_family', 'foster_care', 'prefer_not_to_say'
    )),
    
    -- Life Structure
    military_service BOOLEAN DEFAULT FALSE,
    career_type VARCHAR(50) CHECK (career_type IN (
        'single_career', 'multiple_careers', 'entrepreneur', 
        'homemaker', 'varied', 'prefer_not_to_say'
    )),
    lived_multiple_places BOOLEAN DEFAULT FALSE,
    travel_important BOOLEAN DEFAULT FALSE,
    faith_important BOOLEAN DEFAULT FALSE,
    
    -- Comfort Boundaries (Privacy Controls)
    comfortable_romance BOOLEAN DEFAULT FALSE,
    comfortable_trauma BOOLEAN DEFAULT FALSE,
    skip_personal BOOLEAN DEFAULT FALSE,
    
    -- Timeline Anchors
    birth_year INTEGER CHECK (birth_year >= 1900 AND birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    grew_up_location VARCHAR(255),
    high_school_years VARCHAR(50), -- e.g., "1965-1969"
    first_job_age INTEGER CHECK (first_job_age >= 10 AND first_job_age <= 30),
    major_moves JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"year": 1985, "from": "Chicago, IL", "to": "Seattle, WA", "reason": "job"}]
    partner_met_year INTEGER,
    children_birth_years INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    milestones JSONB DEFAULT '[]'::jsonb,
    -- Example: [{"year": 1990, "event": "Started business", "significance": "high"}]
    
    -- Book Flavor/Tone
    book_tone VARCHAR(50) CHECK (book_tone IN (
        'reflective', 'warm', 'humorous', 'direct', 'conversational'
    )),
    
    -- Metadata
    profile_completed BOOLEAN DEFAULT FALSE,
    profile_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, project_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_project_id ON user_profiles(project_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completed ON user_profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_user_profiles_birth_year ON user_profiles(birth_year);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile questionnaire responses for personalized memoir sections';
COMMENT ON COLUMN user_profiles.major_moves IS 'JSONB array of major relocations with year, from, to, and reason';
COMMENT ON COLUMN user_profiles.milestones IS 'JSONB array of significant life events with year, event, and significance';
COMMENT ON COLUMN user_profiles.comfortable_romance IS 'User comfort level with romantic content in memoir';
COMMENT ON COLUMN user_profiles.comfortable_trauma IS 'User comfort level with traumatic content in memoir';
COMMENT ON COLUMN user_profiles.skip_personal IS 'User preference to skip highly personal questions';

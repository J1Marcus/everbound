export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          owner_id: string
          book_type: 'individual_memoir' | 'family_memoir'
          title: string
          subtitle: string | null
          status: 'setup' | 'collecting' | 'assembling' | 'reviewing' | 'print_ready' | 'completed'
          target_page_count: number
          target_chapter_count: number
          trim_size: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          book_type: 'individual_memoir' | 'family_memoir'
          title: string
          subtitle?: string | null
          status?: 'setup' | 'collecting' | 'assembling' | 'reviewing' | 'print_ready' | 'completed'
          target_page_count?: number
          target_chapter_count?: number
          trim_size?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          book_type?: 'individual_memoir' | 'family_memoir'
          title?: string
          subtitle?: string | null
          status?: 'setup' | 'collecting' | 'assembling' | 'reviewing' | 'print_ready' | 'completed'
          target_page_count?: number
          target_chapter_count?: number
          trim_size?: string
          created_at?: string
          updated_at?: string
        }
      }
      memory_fragments: {
        Row: {
          id: string
          project_id: string
          narrator_id: string
          input_type: 'text' | 'voice' | 'photo'
          raw_content: string
          processed_content: string | null
          metadata: Json
          tags: Json
          status: 'raw' | 'processed' | 'validated' | 'used'
          created_at: string
          updated_at: string
          // Ghostwriter workflow fields
          section_id: string | null
          prompt_id: string | null
          photo_id: string | null
          ai_enhanced_content: string | null
          privacy_level: 'included' | 'private_notes' | 'excluded'
          word_count: number | null
          sensory_richness_score: number | null
          emotional_depth_score: number | null
        }
        Insert: {
          id?: string
          project_id: string
          narrator_id: string
          input_type: 'text' | 'voice' | 'photo'
          raw_content: string
          processed_content?: string | null
          metadata?: Json
          tags?: Json
          status?: 'raw' | 'processed' | 'validated' | 'used'
          created_at?: string
          updated_at?: string
          // Ghostwriter workflow fields
          section_id?: string | null
          prompt_id?: string | null
          photo_id?: string | null
          ai_enhanced_content?: string | null
          privacy_level?: 'included' | 'private_notes' | 'excluded'
          word_count?: number | null
          sensory_richness_score?: number | null
          emotional_depth_score?: number | null
        }
        Update: {
          id?: string
          project_id?: string
          narrator_id?: string
          input_type?: 'text' | 'voice' | 'photo'
          raw_content?: string
          processed_content?: string | null
          metadata?: Json
          tags?: Json
          status?: 'raw' | 'processed' | 'validated' | 'used'
          created_at?: string
          updated_at?: string
          // Ghostwriter workflow fields
          section_id?: string | null
          prompt_id?: string | null
          photo_id?: string | null
          ai_enhanced_content?: string | null
          privacy_level?: 'included' | 'private_notes' | 'excluded'
          word_count?: number | null
          sensory_richness_score?: number | null
          emotional_depth_score?: number | null
        }
      }
      voice_profiles: {
        Row: {
          id: string
          narrator_id: string
          writing_sample: string
          voice_recording_url: string | null
          characteristics: Json
          constraints: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          narrator_id: string
          writing_sample: string
          voice_recording_url?: string | null
          characteristics?: Json
          constraints?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          narrator_id?: string
          writing_sample?: string
          voice_recording_url?: string | null
          characteristics?: Json
          constraints?: Json
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          manuscript_id: string | null
          project_id: string
          chapter_number: number
          title: string
          content: string | null
          component_ids: string[]
          word_count: number
          status: 'insufficient' | 'draft' | 'validated' | 'approved'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manuscript_id?: string | null
          project_id: string
          chapter_number: number
          title: string
          content?: string | null
          component_ids?: string[]
          word_count?: number
          status?: 'insufficient' | 'draft' | 'validated' | 'approved'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manuscript_id?: string | null
          project_id?: string
          chapter_number?: number
          title?: string
          content?: string | null
          component_ids?: string[]
          word_count?: number
          status?: 'insufficient' | 'draft' | 'validated' | 'approved'
          created_at?: string
          updated_at?: string
        }
      }
      manuscripts: {
        Row: {
          id: string
          project_id: string
          version: number
          status: 'draft' | 'review' | 'quality_check' | 'print_ready'
          content: Json
          quality_report: Json | null
          print_specs: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version?: number
          status?: 'draft' | 'review' | 'quality_check' | 'print_ready'
          content?: Json
          quality_report?: Json | null
          print_specs?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version?: number
          status?: 'draft' | 'review' | 'quality_check' | 'print_ready'
          content?: Json
          quality_report?: Json | null
          print_specs?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'narrator' | 'contributor' | 'reviewer'
          permissions: Json
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'narrator' | 'contributor' | 'reviewer'
          permissions?: Json
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'narrator' | 'contributor' | 'reviewer'
          permissions?: Json
          invited_at?: string
          accepted_at?: string | null
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          project_id: string
          marital_status: 'married' | 'partnered' | 'previously_married' | 'previously_partnered' | 'never_married' | 'prefer_not_to_say' | null
          has_children: boolean
          has_siblings: boolean
          raised_by: 'both_parents' | 'single_parent' | 'grandparents' | 'other_family' | 'foster_care' | 'prefer_not_to_say' | null
          military_service: boolean
          career_type: 'single_career' | 'multiple_careers' | 'entrepreneur' | 'homemaker' | 'varied' | 'prefer_not_to_say' | null
          lived_multiple_places: boolean
          travel_important: boolean
          faith_important: boolean
          comfortable_romance: boolean
          comfortable_trauma: boolean
          skip_personal: boolean
          birth_year: number | null
          grew_up_location: string | null
          high_school_years: string | null
          first_job_age: number | null
          major_moves: Json
          partner_met_year: number | null
          children_birth_years: number[]
          milestones: Json
          book_tone: 'reflective' | 'warm' | 'humorous' | 'direct' | 'conversational' | null
          profile_completed: boolean
          profile_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          marital_status?: 'married' | 'partnered' | 'previously_married' | 'previously_partnered' | 'never_married' | 'prefer_not_to_say' | null
          has_children?: boolean
          has_siblings?: boolean
          raised_by?: 'both_parents' | 'single_parent' | 'grandparents' | 'other_family' | 'foster_care' | 'prefer_not_to_say' | null
          military_service?: boolean
          career_type?: 'single_career' | 'multiple_careers' | 'entrepreneur' | 'homemaker' | 'varied' | 'prefer_not_to_say' | null
          lived_multiple_places?: boolean
          travel_important?: boolean
          faith_important?: boolean
          comfortable_romance?: boolean
          comfortable_trauma?: boolean
          skip_personal?: boolean
          birth_year?: number | null
          grew_up_location?: string | null
          high_school_years?: string | null
          first_job_age?: number | null
          major_moves?: Json
          partner_met_year?: number | null
          children_birth_years?: number[]
          milestones?: Json
          book_tone?: 'reflective' | 'warm' | 'humorous' | 'direct' | 'conversational' | null
          profile_completed?: boolean
          profile_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          marital_status?: 'married' | 'partnered' | 'previously_married' | 'previously_partnered' | 'never_married' | 'prefer_not_to_say' | null
          has_children?: boolean
          has_siblings?: boolean
          raised_by?: 'both_parents' | 'single_parent' | 'grandparents' | 'other_family' | 'foster_care' | 'prefer_not_to_say' | null
          military_service?: boolean
          career_type?: 'single_career' | 'multiple_careers' | 'entrepreneur' | 'homemaker' | 'varied' | 'prefer_not_to_say' | null
          lived_multiple_places?: boolean
          travel_important?: boolean
          faith_important?: boolean
          comfortable_romance?: boolean
          comfortable_trauma?: boolean
          skip_personal?: boolean
          birth_year?: number | null
          grew_up_location?: string | null
          high_school_years?: string | null
          first_job_age?: number | null
          major_moves?: Json
          partner_met_year?: number | null
          children_birth_years?: number[]
          milestones?: Json
          book_tone?: 'reflective' | 'warm' | 'humorous' | 'direct' | 'conversational' | null
          profile_completed?: boolean
          profile_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      memoir_sections: {
        Row: {
          id: string
          project_id: string
          section_key: string
          section_title: string
          section_description: string | null
          section_order: number
          is_core: boolean
          is_conditional: boolean
          condition_key: string | null
          condition_value: boolean | null
          is_unlocked: boolean
          is_completed: boolean
          unlocked_at: string | null
          completed_at: string | null
          required_memories: number
          collected_memories: number
          target_word_count: number
          current_word_count: number
          prompts: Json
          quality_score: number | null
          quality_issues: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          section_key: string
          section_title: string
          section_description?: string | null
          section_order: number
          is_core?: boolean
          is_conditional?: boolean
          condition_key?: string | null
          condition_value?: boolean | null
          is_unlocked?: boolean
          is_completed?: boolean
          unlocked_at?: string | null
          completed_at?: string | null
          required_memories?: number
          collected_memories?: number
          target_word_count?: number
          current_word_count?: number
          prompts?: Json
          quality_score?: number | null
          quality_issues?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          section_key?: string
          section_title?: string
          section_description?: string | null
          section_order?: number
          is_core?: boolean
          is_conditional?: boolean
          condition_key?: string | null
          condition_value?: boolean | null
          is_unlocked?: boolean
          is_completed?: boolean
          unlocked_at?: string | null
          completed_at?: string | null
          required_memories?: number
          collected_memories?: number
          target_word_count?: number
          current_word_count?: number
          prompts?: Json
          quality_score?: number | null
          quality_issues?: Json
          created_at?: string
          updated_at?: string
        }
      }
      section_prompts: {
        Row: {
          id: string
          section_id: string
          project_id: string
          prompt_key: string
          prompt_order: number
          prompt_type: 'scene' | 'people' | 'tension' | 'change' | 'meaning' | 'sensory' | 'reflection' | 'photo_context'
          question: string
          guidance: string | null
          example_response: string | null
          target_word_count: number
          min_word_count: number
          max_word_count: number
          sensitivity_tier: number
          requires_comfort_flag: string | null
          privacy_default: 'included' | 'private_notes' | 'ask_user'
          photo_encouraged: boolean
          photo_required: boolean
          photo_prompt: string | null
          is_completed: boolean
          response_count: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          project_id: string
          prompt_key: string
          prompt_order: number
          prompt_type: 'scene' | 'people' | 'tension' | 'change' | 'meaning' | 'sensory' | 'reflection' | 'photo_context'
          question: string
          guidance?: string | null
          example_response?: string | null
          target_word_count?: number
          min_word_count?: number
          max_word_count?: number
          sensitivity_tier?: number
          requires_comfort_flag?: string | null
          privacy_default?: 'included' | 'private_notes' | 'ask_user'
          photo_encouraged?: boolean
          photo_required?: boolean
          photo_prompt?: string | null
          is_completed?: boolean
          response_count?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          project_id?: string
          prompt_key?: string
          prompt_order?: number
          prompt_type?: 'scene' | 'people' | 'tension' | 'change' | 'meaning' | 'sensory' | 'reflection' | 'photo_context'
          question?: string
          guidance?: string | null
          example_response?: string | null
          target_word_count?: number
          min_word_count?: number
          max_word_count?: number
          sensitivity_tier?: number
          requires_comfort_flag?: string | null
          privacy_default?: 'included' | 'private_notes' | 'ask_user'
          photo_encouraged?: boolean
          photo_required?: boolean
          photo_prompt?: string | null
          is_completed?: boolean
          response_count?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      section_synthesis: {
        Row: {
          id: string
          section_id: string
          project_id: string
          preview_content: string | null
          preview_word_count: number | null
          fragment_ids: string[]
          photo_ids: string[]
          quality_score: number | null
          quality_checks: Json
          recommendations: Json
          user_approved: boolean
          user_feedback: string | null
          approved_at: string | null
          generation_model: string | null
          generation_parameters: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          project_id: string
          preview_content?: string | null
          preview_word_count?: number | null
          fragment_ids?: string[]
          photo_ids?: string[]
          quality_score?: number | null
          quality_checks?: Json
          recommendations?: Json
          user_approved?: boolean
          user_feedback?: string | null
          approved_at?: string | null
          generation_model?: string | null
          generation_parameters?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_id?: string
          project_id?: string
          preview_content?: string | null
          preview_word_count?: number | null
          fragment_ids?: string[]
          photo_ids?: string[]
          quality_score?: number | null
          quality_checks?: Json
          recommendations?: Json
          user_approved?: boolean
          user_feedback?: string | null
          approved_at?: string | null
          generation_model?: string | null
          generation_parameters?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          project_id: string
          uploaded_by: string
          file_type: 'photo' | 'audio' | 'document'
          storage_url: string
          storage_path: string
          original_filename: string
          file_size: number
          mime_type: string | null
          metadata: Json
          ai_analysis: Json
          user_context: Json
          narrative_usage: Json
          status: 'uploaded' | 'processing' | 'analyzed' | 'ready' | 'used' | 'archived' | 'failed'
          processing_error: string | null
          created_at: string
          updated_at: string
          analyzed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          uploaded_by: string
          file_type: 'photo' | 'audio' | 'document'
          storage_url: string
          storage_path: string
          original_filename: string
          file_size: number
          mime_type?: string | null
          metadata?: Json
          ai_analysis?: Json
          user_context?: Json
          narrative_usage?: Json
          status?: 'uploaded' | 'processing' | 'analyzed' | 'ready' | 'used' | 'archived' | 'failed'
          processing_error?: string | null
          created_at?: string
          updated_at?: string
          analyzed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          uploaded_by?: string
          file_type?: 'photo' | 'audio' | 'document'
          storage_url?: string
          storage_path?: string
          original_filename?: string
          file_size?: number
          mime_type?: string | null
          metadata?: Json
          ai_analysis?: Json
          user_context?: Json
          narrative_usage?: Json
          status?: 'uploaded' | 'processing' | 'analyzed' | 'ready' | 'used' | 'archived' | 'failed'
          processing_error?: string | null
          created_at?: string
          updated_at?: string
          analyzed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

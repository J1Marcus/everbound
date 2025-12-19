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

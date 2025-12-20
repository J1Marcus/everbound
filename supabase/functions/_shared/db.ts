/**
 * Database Client Utilities
 * Shared database operations and error handling for Edge Functions
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface DatabaseError {
  message: string
  code?: string
  details?: string
}

/**
 * Create authenticated Supabase client from request
 */
export function createAuthenticatedClient(authHeader: string | null): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  })
}

/**
 * Create service role client for admin operations
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Get authenticated user from JWT
 */
export async function getAuthenticatedUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized: Invalid or expired token')
  }
  
  return user
}

/**
 * Verify user has access to project
 */
export async function verifyProjectAccess(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, owner_id')
    .eq('id', projectId)
    .single()

  if (error || !data) {
    return false
  }

  // Check if user is owner
  if (data.owner_id === userId) {
    return true
  }

  // Check if user is collaborator
  const { data: collab } = await supabase
    .from('project_collaborators')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .eq('accepted_at', 'not.null')
    .single()

  return !!collab
}

/**
 * Get user profile for project
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch user profile: ${error.message}`)
  }

  return data
}

/**
 * Get memoir sections for project
 */
export async function geteverboundections(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from('memoir_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('section_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch memoir sections: ${error.message}`)
  }

  return data
}

/**
 * Get memory fragments for section
 */
export async function getSectionFragments(
  supabase: SupabaseClient,
  sectionId: string
) {
  const { data, error } = await supabase
    .from('memory_fragments')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch section fragments: ${error.message}`)
  }

  return data
}

/**
 * Get section prompts
 */
export async function getSectionPrompts(
  supabase: SupabaseClient,
  sectionId: string
) {
  const { data, error } = await supabase
    .from('section_prompts')
    .select('*')
    .eq('section_id', sectionId)
    .order('prompt_order', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch section prompts: ${error.message}`)
  }

  return data
}

/**
 * Handle database errors consistently
 */
export function handleDatabaseError(error: any): DatabaseError {
  console.error('Database error:', error)
  
  return {
    message: error.message || 'Database operation failed',
    code: error.code,
    details: error.details,
  }
}

/**
 * Create standard JSON response
 */
export function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Create error response
 */
export function errorResponse(message: string, status = 500, details?: any) {
  return new Response(
    JSON.stringify({
      error: message,
      details,
    }),
    {
      status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

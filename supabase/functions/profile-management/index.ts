/**
 * Profile Management Edge Function
 * Handles user profile creation, updates, and retrieval for ghostwriter workflow
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  createAuthenticatedClient,
  getAuthenticatedUser,
  verifyProjectAccess,
  jsonResponse,
  errorResponse,
} from '../_shared/db.ts'

interface ProfileData {
  project_id: string
  marital_status?: string
  has_children?: boolean
  has_siblings?: boolean
  raised_by?: string
  military_service?: boolean
  career_type?: string
  lived_multiple_places?: boolean
  travel_important?: boolean
  faith_important?: boolean
  comfortable_romance?: boolean
  comfortable_trauma?: boolean
  skip_personal?: boolean
  birth_year?: number
  grew_up_location?: string
  high_school_years?: string
  first_job_age?: number
  major_moves?: any[]
  partner_met_year?: number
  children_birth_years?: number[]
  milestones?: any[]
  book_tone?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const supabase = createAuthenticatedClient(authHeader)
    const user = await getAuthenticatedUser(supabase)

    const url = new URL(req.url)
    const method = req.method

    // GET /profile-management?projectId=xxx - Get profile for project
    if (method === 'GET') {
      const projectId = url.searchParams.get('projectId')
      
      if (!projectId) {
        return errorResponse('projectId query parameter required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, projectId)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return errorResponse('Failed to fetch profile', 500, error)
      }

      return jsonResponse({ profile })
    }

    // POST /profile-management - Create or update profile
    if (method === 'POST') {
      const body: ProfileData = await req.json()
      
      if (!body.project_id) {
        return errorResponse('project_id is required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, body.project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Check if profile exists
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', body.project_id)
        .maybeSingle()

      let result

      if (existing) {
        // Update existing profile
        const { data, error } = await supabase
          .from('user_profiles')
          .update({
            ...body,
            profile_completed: true,
            profile_completed_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating profile:', error)
          return errorResponse('Failed to update profile', 500, error)
        }

        result = data
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...body,
            profile_completed: true,
            profile_completed_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating profile:', error)
          return errorResponse('Failed to create profile', 500, error)
        }

        result = data

        // Initialize memoir sections for the project
        await initializeeverboundections(supabase, body.project_id, result)
      }

      return jsonResponse({ 
        profile: result,
        message: existing ? 'Profile updated successfully' : 'Profile created successfully'
      })
    }

    // PATCH /profile-management - Partial update
    if (method === 'PATCH') {
      const body = await req.json()
      
      if (!body.project_id) {
        return errorResponse('project_id is required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, body.project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(body)
        .eq('user_id', user.id)
        .eq('project_id', body.project_id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return errorResponse('Failed to update profile', 500, error)
      }

      return jsonResponse({ profile: data })
    }

    return errorResponse('Method not allowed', 405)

  } catch (error) {
    console.error('Profile management error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
})

/**
 * Initialize memoir sections when profile is created
 */
async function initializeeverboundections(
  supabase: any,
  projectId: string,
  profile: any
) {
  // Check if sections already exist
  const { data: existing } = await supabase
    .from('memoir_sections')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)

  if (existing && existing.length > 0) {
    return // Sections already initialized
  }

  // Core sections (always created)
  const coreSections = [
    {
      project_id: projectId,
      section_key: 'origins',
      section_title: 'Origins',
      section_description: 'Your birth, family background, and early home',
      section_order: 1,
      is_core: true,
      is_unlocked: true,
      required_memories: 5,
    },
    {
      project_id: projectId,
      section_key: 'childhood',
      section_title: 'Childhood',
      section_description: 'School, friends, routines, early joys and fears',
      section_order: 2,
      is_core: true,
      is_unlocked: true,
      required_memories: 6,
    },
    {
      project_id: projectId,
      section_key: 'teen_years',
      section_title: 'Teen Years',
      section_description: 'Identity, rebellion, passions, formative moments',
      section_order: 3,
      is_core: true,
      is_unlocked: false,
      required_memories: 5,
    },
    {
      project_id: projectId,
      section_key: 'early_adulthood',
      section_title: 'Early Adulthood',
      section_description: 'Leaving home, first independence, early work',
      section_order: 4,
      is_core: true,
      is_unlocked: false,
      required_memories: 5,
    },
    {
      project_id: projectId,
      section_key: 'work_purpose',
      section_title: 'Work & Purpose',
      section_description: 'Career arcs, proud moments, failures, lessons',
      section_order: 5,
      is_core: true,
      is_unlocked: false,
      required_memories: 6,
    },
    {
      project_id: projectId,
      section_key: 'values_beliefs',
      section_title: 'Values & Beliefs',
      section_description: 'What mattered, what changed, why',
      section_order: 6,
      is_core: true,
      is_unlocked: false,
      required_memories: 4,
    },
    {
      project_id: projectId,
      section_key: 'hobbies_joy',
      section_title: 'Hobbies & Joy',
      section_description: 'Sports, music, books, travel, things that made life feel alive',
      section_order: 7,
      is_core: true,
      is_unlocked: false,
      required_memories: 5,
    },
    {
      project_id: projectId,
      section_key: 'milestones',
      section_title: 'Milestones & Turning Points',
      section_description: 'Moves, losses, wins, surprises',
      section_order: 8,
      is_core: true,
      is_unlocked: false,
      required_memories: 6,
    },
    {
      project_id: projectId,
      section_key: 'lessons_legacy',
      section_title: 'Lessons & Legacy',
      section_description: 'Advice, regrets, gratitude, what you hope they remember',
      section_order: 9,
      is_core: true,
      is_unlocked: false,
      required_memories: 5,
    },
  ]

  // Conditional sections based on profile
  const conditionalSections = []
  let order = 10

  if (profile.marital_status && profile.marital_status !== 'never_married') {
    conditionalSections.push({
      project_id: projectId,
      section_key: 'love_partnership',
      section_title: 'Love & Partnership',
      section_description: 'Met partner, romance, marriage, hard seasons',
      section_order: order++,
      is_core: false,
      is_unlocked: false,
      required_memories: 5,
    })
  }

  if (profile.has_children) {
    conditionalSections.push({
      project_id: projectId,
      section_key: 'parenthood',
      section_title: 'Parenthood',
      section_description: 'Naming kids, what surprised you, what you learned',
      section_order: order++,
      is_core: false,
      is_unlocked: false,
      required_memories: 6,
    })
  }

  if (profile.has_siblings) {
    conditionalSections.push({
      project_id: projectId,
      section_key: 'family_web',
      section_title: 'Family Web',
      section_description: 'Siblings, cousins, grandparents, family traditions',
      section_order: order++,
      is_core: false,
      is_unlocked: false,
      required_memories: 5,
    })
  }

  if (profile.military_service || profile.comfortable_trauma) {
    conditionalSections.push({
      project_id: projectId,
      section_key: 'service_sacrifice',
      section_title: 'Service & Sacrifice',
      section_description: 'Military, caregiving, major hardship',
      section_order: order++,
      is_core: false,
      is_unlocked: false,
      required_memories: 5,
    })
  }

  if (profile.travel_important) {
    conditionalSections.push({
      project_id: projectId,
      section_key: 'big_adventures',
      section_title: 'Big Adventures',
      section_description: 'Skydiving, concerts, travel stories, "first time I…"',
      section_order: order++,
      is_core: false,
      is_unlocked: false,
      required_memories: 4,
    })
  }

  // Insert all sections
  const allSections = [...coreSections, ...conditionalSections]
  const { error } = await supabase
    .from('memoir_sections')
    .insert(allSections)

  if (error) {
    console.error('Error initializing sections:', error)
    throw error
  }

  console.log(`Initialized ${allSections.length} sections for project ${projectId}`)
}

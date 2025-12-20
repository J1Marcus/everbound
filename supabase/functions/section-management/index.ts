/**
 * Section Management Edge Function
 * Handles section listing, unlocking, and prompt retrieval
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  createAuthenticatedClient,
  getAuthenticatedUser,
  verifyProjectAccess,
  getSectionPrompts,
  jsonResponse,
  errorResponse,
} from '../_shared/db.ts'
import {
  getAllSectionsStatus,
  unlockNextSection,
  checkUnlockEligibility,
  completeSectionIfReady,
} from '../_shared/section-logic.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
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
    const pathname = url.pathname

    // GET /section-management?projectId=xxx - Get all sections with status
    if (method === 'GET' && !pathname.includes('/unlock') && !pathname.includes('/prompts')) {
      const projectId = url.searchParams.get('projectId')
      
      if (!projectId) {
        return errorResponse('projectId query parameter required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, projectId)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get all sections with status
      const sections = await getAllSectionsStatus(supabase, projectId)

      return jsonResponse({ sections })
    }

    // POST /section-management/unlock - Unlock next section
    if (method === 'POST' && pathname.includes('/unlock')) {
      const body = await req.json()
      const { current_section_id, project_id } = body

      if (!current_section_id || !project_id) {
        return errorResponse('current_section_id and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Try to complete current section first
      const completionResult = await completeSectionIfReady(supabase, current_section_id)
      
      if (!completionResult.success) {
        return jsonResponse({
          success: false,
          message: completionResult.message,
          can_complete: false,
        })
      }

      // Unlock next section
      const unlockResult = await unlockNextSection(supabase, current_section_id, project_id)

      return jsonResponse(unlockResult)
    }

    // GET /section-management/prompts?sectionId=xxx - Get prompts for section
    if (method === 'GET' && pathname.includes('/prompts')) {
      const sectionId = url.searchParams.get('sectionId')
      
      if (!sectionId) {
        return errorResponse('sectionId query parameter required', 400)
      }

      // Get section to verify project access
      const { data: section, error: sectionError } = await supabase
        .from('memoir_sections')
        .select('project_id')
        .eq('id', sectionId)
        .single()

      if (sectionError || !section) {
        return errorResponse('Section not found', 404)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, section.project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      // Get prompts
      const prompts = await getSectionPrompts(supabase, sectionId)

      return jsonResponse({ prompts })
    }

    // POST /section-management/check-eligibility - Check if section can be unlocked
    if (method === 'POST' && pathname.includes('/check-eligibility')) {
      const body = await req.json()
      const { section_id, project_id } = body

      if (!section_id || !project_id) {
        return errorResponse('section_id and project_id are required', 400)
      }

      // Verify access
      const hasAccess = await verifyProjectAccess(supabase, user.id, project_id)
      if (!hasAccess) {
        return errorResponse('Access denied to this project', 403)
      }

      const eligibility = await checkUnlockEligibility(supabase, section_id, project_id)

      return jsonResponse(eligibility)
    }

    return errorResponse('Method not allowed or invalid endpoint', 405)

  } catch (error) {
    console.error('Section management error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    )
  }
})

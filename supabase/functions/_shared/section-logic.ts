/**
 * Section Unlocking Logic
 * Progressive unlocking rules and section completion validation
 */

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface SectionStatus {
  section_id: string
  section_key: string
  section_title: string
  is_unlocked: boolean
  is_completed: boolean
  required_memories: number
  collected_memories: number
  progress_percentage: number
  can_unlock_next: boolean
  quality_threshold_met: boolean
}

export interface UnlockEligibility {
  eligible: boolean
  reason?: string
  requirements: {
    min_memories: boolean
    quality_threshold: boolean
    previous_section_complete: boolean
  }
}

/**
 * Check if section meets unlock eligibility requirements
 */
export async function checkUnlockEligibility(
  supabase: SupabaseClient,
  sectionId: string,
  projectId: string
): Promise<UnlockEligibility> {
  // Get the section
  const { data: section, error: sectionError } = await supabase
    .from('memoir_sections')
    .select('*')
    .eq('id', sectionId)
    .single()

  if (sectionError || !section) {
    return {
      eligible: false,
      reason: 'Section not found',
      requirements: {
        min_memories: false,
        quality_threshold: false,
        previous_section_complete: false,
      }
    }
  }

  // If already unlocked, return true
  if (section.is_unlocked) {
    return {
      eligible: true,
      requirements: {
        min_memories: true,
        quality_threshold: true,
        previous_section_complete: true,
      }
    }
  }

  // Check if previous section is complete
  const { data: previousSection } = await supabase
    .from('memoir_sections')
    .select('is_completed')
    .eq('project_id', projectId)
    .eq('section_order', section.section_order - 1)
    .single()

  const previousSectionComplete = !previousSection || previousSection.is_completed

  // Get memory fragments for previous section to check quality
  let qualityThresholdMet = true
  if (previousSection) {
    const { data: prevSectionData } = await supabase
      .from('memoir_sections')
      .select('id')
      .eq('project_id', projectId)
      .eq('section_order', section.section_order - 1)
      .single()

    if (prevSectionData) {
      const { data: fragments } = await supabase
        .from('memory_fragments')
        .select('sensory_richness_score, emotional_depth_score')
        .eq('section_id', prevSectionData.id)

      if (fragments && fragments.length > 0) {
        const avgQuality = fragments.reduce((sum, f) => {
          const score = ((f.sensory_richness_score || 0) + (f.emotional_depth_score || 0)) / 2
          return sum + score
        }, 0) / fragments.length

        qualityThresholdMet = avgQuality >= 0.4 // 40% quality threshold
      }
    }
  }

  const eligible = previousSectionComplete && qualityThresholdMet

  return {
    eligible,
    reason: !eligible 
      ? !previousSectionComplete 
        ? 'Previous section must be completed first'
        : 'Previous section needs higher quality memories'
      : undefined,
    requirements: {
      min_memories: true, // Checked at completion, not unlock
      quality_threshold: qualityThresholdMet,
      previous_section_complete: previousSectionComplete,
    }
  }
}

/**
 * Get section status with progress
 */
export async function getSectionStatus(
  supabase: SupabaseClient,
  sectionId: string
): Promise<SectionStatus> {
  // Get section details
  const { data: section, error } = await supabase
    .from('memoir_sections')
    .select('*')
    .eq('id', sectionId)
    .single()

  if (error || !section) {
    throw new Error('Section not found')
  }

  // Count collected memories
  const { count: collectedCount } = await supabase
    .from('memory_fragments')
    .select('*', { count: 'exact', head: true })
    .eq('section_id', sectionId)

  const collected = collectedCount || 0
  const required = section.required_memories || 5
  const progress = Math.min((collected / required) * 100, 100)

  // Check if can unlock next section
  const canUnlockNext = collected >= required && section.is_unlocked

  // Check quality threshold
  const { data: fragments } = await supabase
    .from('memory_fragments')
    .select('sensory_richness_score, emotional_depth_score')
    .eq('section_id', sectionId)

  let qualityThresholdMet = false
  if (fragments && fragments.length > 0) {
    const avgQuality = fragments.reduce((sum, f) => {
      const score = ((f.sensory_richness_score || 0) + (f.emotional_depth_score || 0)) / 2
      return sum + score
    }, 0) / fragments.length

    qualityThresholdMet = avgQuality >= 0.4
  }

  return {
    section_id: section.id,
    section_key: section.section_key,
    section_title: section.section_title,
    is_unlocked: section.is_unlocked,
    is_completed: section.is_completed,
    required_memories: required,
    collected_memories: collected,
    progress_percentage: Math.round(progress),
    can_unlock_next: canUnlockNext,
    quality_threshold_met: qualityThresholdMet,
  }
}

/**
 * Unlock next section if eligible
 */
export async function unlockNextSection(
  supabase: SupabaseClient,
  currentSectionId: string,
  projectId: string
): Promise<{ success: boolean; unlockedSection?: any; message: string }> {
  // Get current section
  const { data: currentSection } = await supabase
    .from('memoir_sections')
    .select('section_order, is_completed')
    .eq('id', currentSectionId)
    .single()

  if (!currentSection) {
    return { success: false, message: 'Current section not found' }
  }

  if (!currentSection.is_completed) {
    return { success: false, message: 'Current section must be completed first' }
  }

  // Get next section
  const { data: nextSection } = await supabase
    .from('memoir_sections')
    .select('*')
    .eq('project_id', projectId)
    .eq('section_order', currentSection.section_order + 1)
    .single()

  if (!nextSection) {
    return { success: false, message: 'No next section available' }
  }

  if (nextSection.is_unlocked) {
    return { success: true, unlockedSection: nextSection, message: 'Section already unlocked' }
  }

  // Check eligibility
  const eligibility = await checkUnlockEligibility(supabase, nextSection.id, projectId)

  if (!eligibility.eligible) {
    return { success: false, message: eligibility.reason || 'Section not eligible for unlock' }
  }

  // Unlock the section
  const { data: updated, error } = await supabase
    .from('memoir_sections')
    .update({ is_unlocked: true })
    .eq('id', nextSection.id)
    .select()
    .single()

  if (error) {
    return { success: false, message: `Failed to unlock section: ${error.message}` }
  }

  return {
    success: true,
    unlockedSection: updated,
    message: `Section "${nextSection.section_title}" unlocked!`
  }
}

/**
 * Mark section as complete if requirements met
 */
export async function completeSectionIfReady(
  supabase: SupabaseClient,
  sectionId: string
): Promise<{ success: boolean; message: string }> {
  const status = await getSectionStatus(supabase, sectionId)

  if (status.is_completed) {
    return { success: true, message: 'Section already completed' }
  }

  if (!status.is_unlocked) {
    return { success: false, message: 'Section must be unlocked first' }
  }

  if (status.collected_memories < status.required_memories) {
    return {
      success: false,
      message: `Need ${status.required_memories - status.collected_memories} more memories`
    }
  }

  if (!status.quality_threshold_met) {
    return {
      success: false,
      message: 'Memories need more detail and depth to complete section'
    }
  }

  // Mark as complete
  const { error } = await supabase
    .from('memoir_sections')
    .update({ is_completed: true })
    .eq('id', sectionId)

  if (error) {
    return { success: false, message: `Failed to complete section: ${error.message}` }
  }

  return { success: true, message: 'Section completed!' }
}

/**
 * Get all sections with status for project
 */
export async function getAllSectionsStatus(
  supabase: SupabaseClient,
  projectId: string
): Promise<SectionStatus[]> {
  const { data: sections, error } = await supabase
    .from('memoir_sections')
    .select('*')
    .eq('project_id', projectId)
    .order('section_order', { ascending: true })

  if (error || !sections) {
    throw new Error('Failed to fetch sections')
  }

  const statusPromises = sections.map(section => getSectionStatus(supabase, section.id))
  return await Promise.all(statusPromises)
}

/**
 * Determine which sections should be visible based on profile
 */
export function filterSectionsByProfile(
  sections: any[],
  profile: any
): any[] {
  return sections.filter(section => {
    // Core sections always visible
    if (section.is_core) {
      return true
    }

    // Conditional sections based on profile
    switch (section.section_key) {
      case 'love_partnership':
        return profile.marital_status && profile.marital_status !== 'never_married'
      
      case 'parenthood':
        return profile.has_children
      
      case 'family_web':
        return profile.has_siblings
      
      case 'service_sacrifice':
        return profile.military_service || profile.comfortable_trauma
      
      case 'big_adventures':
        return profile.travel_important
      
      default:
        return true
    }
  })
}

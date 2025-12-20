/**
 * Test file for profile-management Edge Function
 * Run with: deno test --allow-net --allow-env test.ts
 */

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts'

const FUNCTION_URL = 'http://localhost:9000/profile-management'
const TEST_TOKEN = 'your-test-jwt-token'

// Example test requests
const exampleRequests = {
  createProfile: {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: 'test-project-id',
      birth_year: 1980,
      has_children: true,
      has_siblings: true,
      marital_status: 'married',
      book_tone: 'warm',
      comfortable_romance: true,
      comfortable_trauma: false,
      skip_personal: false,
    }),
  },
  
  getProfile: {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
  },
  
  updateProfile: {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TEST_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: 'test-project-id',
      book_tone: 'reflective',
    }),
  },
}

// Manual testing instructions
console.log('=== Profile Management Edge Function Tests ===\n')

console.log('1. Create Profile:')
console.log(`curl -X POST ${FUNCTION_URL} \\`)
console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`)
console.log(`  -H "Content-Type: application/json" \\`)
console.log(`  -d '${exampleRequests.createProfile.body}'`)
console.log()

console.log('2. Get Profile:')
console.log(`curl "${FUNCTION_URL}?projectId=test-project-id" \\`)
console.log(`  -H "Authorization: Bearer YOUR_TOKEN"`)
console.log()

console.log('3. Update Profile:')
console.log(`curl -X PATCH ${FUNCTION_URL} \\`)
console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`)
console.log(`  -H "Content-Type: application/json" \\`)
console.log(`  -d '${exampleRequests.updateProfile.body}'`)
console.log()

console.log('Expected Responses:')
console.log('- Create: { profile: {...}, message: "Profile created successfully" }')
console.log('- Get: { profile: {...} }')
console.log('- Update: { profile: {...} }')
console.log()

console.log('Error Cases to Test:')
console.log('- Missing Authorization header → 401 Unauthorized')
console.log('- Invalid project_id → 400 Bad Request')
console.log('- Access to another user\'s project → 403 Forbidden')

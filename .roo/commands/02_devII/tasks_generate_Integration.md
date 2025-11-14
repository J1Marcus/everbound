# Integration Task Generator — Phase 2 Integration Planning

You are tasked with conducting a comprehensive code review of components not fully integrated and generating detailed integration tasks. This command focuses on identifying integration gaps, planning data connections, and creating tasks for Phase 2 integration work.

---

## CRITICAL REQUIREMENTS

### ⚠️ SCOPE LOCK GUARDRAILS

**INTEGRATION ONLY - NO NEW DEVELOPMENT**
- **ONLY wire existing components** - No new React components, pages, routes, or UI elements
- **ONLY use existing services/hooks** - No new service classes or custom hooks
- **ONLY use existing libraries** - No new dependencies or framework additions
- **ONLY modify existing files** - No new file creation except for tests
- **ONLY connect to documented endpoints** - Must map to backend integration documentation

**FORBIDDEN ACTIVITIES**:
- ❌ Creating new UI components or pages
- ❌ Adding new npm dependencies
- ❌ Redesigning existing interfaces
- ❌ Creating new service classes
- ❌ Modifying environment files
- ❌ Adding new routing or navigation

### Integration Assessment Scope

**Option 1: Specific Component/Folder Analysis**
- Accept specific folder or file paths to analyze
- Focus integration review on specified components
- Generate targeted integration tasks

**Option 2: Full Project Integration Review**
If no specific paths provided, analyze ALL project components:
- **Source Code**: All files in `src/` directory
- **Components**: All React components and their integration status
- **Stores**: All state management stores and their data connections
- **Pages**: All page components and their data dependencies
- **Services**: All API service layers and their endpoint connections
- **Hooks**: All custom hooks and their data integration points

### Integration Documentation Sources
Reference these documents for integration context (adapt paths to project structure):
- **Architecture Document**: Look for architecture/design documents in `ai_docs/` or `docs/`
- **Backend Integration Guide**: Look for backend integration documentation
- **API Documentation**: Reference available API endpoint documentation
- **WBS/Project Planning**: Reference work breakdown structure documents
- **Phase 1 Tasks**: Any existing task files or implementation outcomes

---

## Integration Analysis Framework

### 1. Component Integration Status Assessment

For each component, evaluate:
- **Mock Data Usage**: Components still using mock/hardcoded data
- **State Integration**: Components not connected to appropriate state management
- **API Integration**: Components missing real backend connections
- **Error Handling**: Components with basic/missing error handling
- **Loading States**: Components with incomplete loading state management
- **Authentication Integration**: Components not properly handling auth state

### 2. Data Flow Analysis

Analyze data flow patterns:
- **State Management Connections**: Which stores/contexts need real data integration
- **API Endpoint Mapping**: Missing or incomplete backend endpoint connections
- **Data Persistence**: Components not properly persisting data
- **Cache Management**: Components needing proper cache invalidation
- **Cross-Component Communication**: Missing component data sharing

### 3. Integration Dependencies

Identify integration dependencies:
- **Backend API Endpoints**: Required backend service connections
- **Authentication System**: Components needing auth integration
- **State Management**: Components needing store/context connections
- **Error Handling System**: Components needing standardized error handling
- **Loading/Progress Indicators**: Components needing loading state management

### 4. Mandatory Endpoint Mapping

**CRITICAL**: Every integration task MUST include:
- **Component → Service/Hook → Endpoint(s)** mapping from backend documentation
- **HTTP Method, Parameters, Response Codes** for each endpoint
- **Authentication Requirements** (user JWT token handling)
- **Error Response Handling** (400/401/403/404/422/500 scenarios)
- **Cache Strategy** (query keys, invalidation, staleTime)

---

## Preflight API Smoke Tests

**MANDATORY**: Every integration task list MUST begin with these preflight tests:

### Backend Connectivity Verification

```
**API Smoke Tests**: Verify backend connectivity before integration
- **Test Type**: Preflight Verification
- **Purpose**: Ensure backend is accessible and authentication works
- **Test Requirements**:
  - [ ] Health Check: GET /health (expect 200 OK)
  - [ ] Authentication Test: POST /auth/login (expect 200 with token)
  - [ ] User Info Test: GET /auth/me (expect 200 with user data)
  - [ ] Error Handling Test: GET /invalid-endpoint (expect 404)
- **Curl Examples** (replace [API_BASE_URL], [TEST_EMAIL], [TEST_PASSWORD], [JWT_TOKEN] with actual values):
  ```bash
  # Health check
  curl -s -o /dev/null -w "%{http_code}" [API_BASE_URL]/health
  
  # Authentication test
  curl -X POST "[API_BASE_URL]/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"[TEST_EMAIL]","password":"[TEST_PASSWORD]"}'
  
  # User info test (with token from login)
  curl -X GET "[API_BASE_URL]/auth/me" \
    -H "Authorization: Bearer [JWT_TOKEN]"
  ```
- **Success Criteria**: All tests return expected status codes and response format
- **Failure Action**: Do not proceed with integration until backend issues are resolved
```

---

## Integration Task Generation Strategy

### Phase 2 Integration Focus

**Phase 2 Integration includes:**
- Replace mock data with real backend API connections
- Implement comprehensive error handling with standardized patterns
- Add proper loading states and progress indicators
- Connect existing components to documented backend endpoints
- Implement proper authentication token handling
- Add cache management and data synchronization
- Enhance user feedback with proper error messages

### Integration Task Structure

Each integration task MUST include:

```
**[Component/Feature Name] Integration**: [Specific Integration Action]
- **File Location**: `src/[exact-path]` (existing file only)
- **Integration Type**: [Mock-to-Real Data | API Connection | Auth Integration | Error Handling | etc.]
- **Current State**: [Description of current implementation]
- **Backend Endpoint Mapping**:
  - **Endpoint**: [HTTP_METHOD] /api/endpoint/path
  - **Parameters**: [Required and optional parameters]
  - **Response Codes**: [Expected success/error codes]
  - **Authentication**: [User JWT token requirements]
- **Integration Requirements**:
  - [ ] Connect to existing service/hook: `[service/hook name]`
  - [ ] Map to backend endpoint: `[endpoint details]`
  - [ ] Implement error handling for: [specific error scenarios]
  - [ ] Add loading states for: [specific operations]
  - [ ] Configure cache strategy: [query keys and invalidation]
- **Existing Dependencies**: [Current services, hooks, or stores to use]
- **Testing Requirements**: [Integration tests using existing test infrastructure]
- **Risk Assessment**: [Potential integration risks and mitigations]
```

### Authentication Integration Requirements

**MANDATORY for all authenticated endpoints:**
- **Frontend MUST use user JWT tokens only** (never M2M tokens)
- **Use existing authentication store/context** for token management
- **Follow existing request helper patterns** for authenticated calls
- **Implement standard error handling** for 401/403 scenarios
- **Test authentication flow**: login → store token → authenticated request

---

## Integration-Specific Task Templates

### Mock Data to Real Data Integration

```
**[Component Name] Data Integration**: Replace mock data with real backend connections
- **File Location**: `src/[component-path]` (existing file only)
- **Integration Type**: Mock-to-Real Data
- **Current State**: Using mock/hardcoded data from [mock-source]
- **Backend Endpoint Mapping**:
  - **Endpoint**: [HTTP_METHOD] /api/[endpoint-path]
  - **Parameters**: [Required: param1, param2 | Optional: param3]
  - **Response Codes**: [200: success, 401: unauthorized, 404: not found, etc.]
  - **Authentication**: User JWT token required
- **Integration Requirements**:
  - [ ] Use existing service/hook: `[existing-service-name]`
  - [ ] Connect to documented endpoint: `[endpoint-details]`
  - [ ] Implement standardized error handling for: [400/401/403/404/422/500]
  - [ ] Add loading states for: [data fetch operations]
  - [ ] Configure cache strategy: [query-key, staleTime, invalidation]
- **Existing Dependencies**: [Current services, hooks, stores to reuse]
- **Testing Requirements**: Integration tests using existing test patterns
- **Risk Assessment**: Network failures, data format changes, authentication issues
```

### Authentication Integration Tasks

```
**[Component Name] Auth Integration**: Connect component to authentication system
- **File Location**: `src/[component-path]` (existing file only)
- **Integration Type**: Authentication Integration
- **Current State**: Missing or incomplete auth integration
- **Backend Endpoint Mapping**:
  - **Login Endpoint**: POST /auth/login
  - **User Info Endpoint**: GET /auth/me
  - **Token Refresh**: POST /auth/refresh (if applicable)
  - **Authentication**: User JWT token (never M2M tokens)
- **Integration Requirements**:
  - [ ] Use existing auth store/context for token management
  - [ ] Implement user JWT token handling only
  - [ ] Add 401/403 error handling with redirect to login
  - [ ] Use existing authenticated request helpers
  - [ ] Test login → store token → authenticated request flow
- **Existing Dependencies**: [Auth store, request helpers, error handlers]
- **Testing Requirements**: Auth flow tests using existing patterns
- **Risk Assessment**: Token expiration, permission errors, session management
```

### Error Handling Enhancement

```
**[Component Name] Error Handling**: Implement comprehensive error handling
- **File Location**: `src/[component-path]` (existing file only)
- **Integration Type**: Error Handling Enhancement
- **Current State**: Basic or missing error handling
- **Backend Error Mapping**:
  - **400**: Bad Request - validation errors
  - **401**: Unauthorized - redirect to login
  - **403**: Forbidden - show permission error
  - **404**: Not Found - show not found message
  - **422**: Validation Error - show field-specific errors
  - **500+**: Server Error - show generic error message
- **Integration Requirements**:
  - [ ] Use existing error handling utilities
  - [ ] Implement standardized error response handling
  - [ ] Add user-friendly error messages
  - [ ] Add error recovery mechanisms where applicable
  - [ ] Use existing notification/toast system for errors
- **Existing Dependencies**: [Error utilities, notification system, UI components]
- **Testing Requirements**: Error scenario testing using existing patterns
- **Risk Assessment**: User experience degradation, error message clarity
```

---

## Integration Review Process

### 1. Code Analysis Phase

**Automated Analysis**:
- Scan for mock data usage patterns
- Identify components with TODO/FIXME comments
- Find components missing error boundaries
- Locate hardcoded values that need configuration

**Manual Review**:
- Assess component architecture compliance
- Review state management patterns
- Evaluate error handling completeness
- Check integration with existing systems

### 2. Integration Gap Identification

**Data Integration Gaps**:
- Components still using mock data
- Missing API connections
- Incomplete data validation
- Missing data persistence

**System Integration Gaps**:
- Missing authentication integration
- Incomplete notification systems
- Missing offline/sync capabilities
- Inadequate error handling

### 3. Priority Assessment

**High Priority Integration**:
- Core user workflows missing real data
- Security-critical integrations
- Performance-impacting mock data usage
- User-facing error handling gaps

**Medium Priority Integration**:
- Nice-to-have data connections
- Enhanced error messaging
- Performance optimizations
- Advanced loading states

**Low Priority Integration**:
- Non-critical API connections
- Advanced caching strategies
- Optional notification enhancements
- Cosmetic improvements

---

## Output Structure

### Integration Task Organization

```markdown
# Integration Tasks — Phase 2 Implementation

`Comprehensive integration planning based on code review analysis`

## Preflight API Smoke Tests
[MANDATORY: Backend connectivity verification before integration]

## Integration Assessment Summary
[Overview of integration gaps found and current architecture analysis]

## Component-Endpoint Mapping Table
[CRITICAL: Component → Service/Hook → Backend Endpoint mapping for each feature group]

### Example Feature Group Mapping:
| Component | Current Service/Hook | Backend Endpoint | Method | Auth Required | Status |
|-----------|---------------------|------------------|---------|---------------|---------|
| StudentList | useStudents | /api/v1/students | GET | Yes | Mock Data |
| StudentForm | useStudents | /api/v1/students | POST/PUT | Yes | Mock Data |
| LessonCalendar | useLessons | /api/v1/lessons | GET | Yes | Mock Data |

## Integration Priority Matrix
[High/Medium/Low priority integration tasks with business impact assessment]

## Phase 2: Integration & Data Connections

### Critical Data Integrations (High Priority)
[Core user workflows requiring immediate backend connection]

### Authentication & Security Integration
[User JWT token handling and auth flow integration]

### API Integration Tasks (Medium Priority)
[Secondary features needing backend connections]

### Error Handling Enhancements
[Standardized error handling for all API endpoints]

### Performance & Caching
[Query optimization and cache management integration]

## Integration Dependencies
[Existing services, hooks, stores, and utilities to reuse]

## Integration Testing Strategy
[Testing approach using existing test infrastructure]

## Integration Risks & Mitigations
[Potential risks and mitigation strategies with rollback plans]

## Integration Success Criteria
[Measurable criteria for integration completion and acceptance testing]

## Environment & Configuration Notes
[Project-specific configuration requirements and constraints]
```

---

## Usage Instructions

### With Specific Component/Folder

1. **Analyze Specified Components**: Focus review on provided paths
2. **Assess Integration Status**: Evaluate current integration state
3. **Generate Targeted Tasks**: Create specific integration tasks
4. **Output Location**: Save to `ai_docs/tasks/[component-name]/integration_tasks.md`

### Full Project Integration Review

1. **Scan All Components**: Review entire src/ directory
2. **Identify Integration Gaps**: Find all components needing integration
3. **Prioritize Integration Tasks**: Order by business impact and complexity
4. **Output Location**: Save to `ai_docs/tasks/integration_tasks.md`

---

## Integration Quality Assurance

### Integration Task Validation Checklist

- [ ] Integration gaps are accurately identified
- [ ] Tasks include specific technical requirements
- [ ] Dependencies are clearly documented
- [ ] Risk assessments are realistic and actionable
- [ ] Testing requirements are comprehensive
- [ ] Priority levels are business-aligned

### Integration Risk Prevention

1. **Dependency Management**: Ensure all external dependencies are available
2. **Backward Compatibility**: Maintain existing functionality during integration
3. **Performance Impact**: Assess and mitigate performance implications
4. **Error Handling**: Implement robust error handling for all integrations
5. **Testing Coverage**: Ensure comprehensive integration testing

---

**Critical**: Integration tasks must be implementation-ready with clear technical specifications, realistic timelines, and comprehensive risk assessments to ensure successful Phase 2 completion.
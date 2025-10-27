# Quick Tasks Executor — Streamlined Task Execution Service

## VARIABLES
{{FILE}}: If no file is provided use `ai_docs/tasks/tasks_list.md` as {{FILE}}.
{{FILE_DIRECTORY}} is the directory of {{FILE}}.

## CORE PRINCIPLES

**YOU MUST IMPLEMENT EXISTING TASKS - DO NOT GENERATE NEW ONES**

- **Read & Implement**: Process ALL pre-defined tasks from {{FILE}}
- **Pattern-Based**: Use established codebase patterns consistently  
- **Complete Execution**: Process EVERY task group systematically
- **Document Outcomes**: Track progress and results comprehensively

---

## EXECUTION WORKFLOW

### 1. Context Analysis (MANDATORY FIRST STEP)
```bash
# Use codebase_search FIRST for any new code exploration
codebase_search("task-related functionality patterns")

# Then gather project context
- Read {{FILE}} completely for ALL pre-defined tasks
- Review {{FILE_DIRECTORY}}/outcome.md for current progress
- Identify established patterns in src/services/, src/components/, src/hooks/
- Map tasks to existing implementations and dependencies
```

### 2. Task Grouping Strategy
Group tasks by:
- **Dependency Chain**: Sequential tasks (auth → API → services → UI)
- **Domain/Feature**: Related functionality (student management, payments, communication)
- **Complexity Level**: Simple configs → Complex integrations
- **Context Window**: 5-7 related tasks per group maximum

### 3. Pattern Identification
```bash
# For each task group, identify:
- Existing similar implementations in codebase
- Required services, hooks, and utilities to reuse
- Project-specific patterns and conventions
- Dependencies and integration points
```

### 4. Orchestrator Delegation
```bash
# Switch to orchestrator mode
switch_mode('orchestrator')

# Delegate each task group with complete context
new_task('code', 'Execute Task Group: [GROUP_NAME]
Context: [Existing patterns and dependencies]
Tasks: [Specific tasks with success criteria]
Patterns: [Code examples and established approaches]
Validation: [How to verify completion]')
```

### 5. Outcome Documentation
Update `{{FILE_DIRECTORY}}/outcome.md` for each completed group:
- Task group description and approach used
- Files modified/created with specific changes
- Patterns leveraged and any adaptations made
- Issues encountered and resolutions applied
- Validation results and success confirmation

---

## TASK GROUPING EXAMPLES

### Authentication Integration Group
**Tasks**: Update auth store, configure API endpoints, test token management
**Pattern**: Existing `src/stores/authStore.ts` with JWT handling
**Dependencies**: `src/services/api.ts`, `src/services/errorHandling.ts`
**Success Criteria**: Login flow works with real backend, tokens refresh properly

### Component Integration Group  
**Tasks**: Connect StudentList to real API, add error handling, update tests
**Pattern**: Existing `src/hooks/useStudents.ts` with TanStack Query
**Dependencies**: `src/services/studentService.ts`, `src/components/students/`
**Success Criteria**: Data loads from API, errors handled gracefully, tests pass

### Service Layer Group
**Tasks**: Update service endpoints, implement error handling, test API calls
**Pattern**: Existing `src/services/BaseApiService.ts` with retry logic
**Dependencies**: `src/services/errorHandling.ts`, `src/services/api.ts`
**Success Criteria**: All CRUD operations work, proper error responses handled

---

## CONTEXT INTEGRATION FRAMEWORK

### Pre-Execution Context Gathering
1. **Architecture Review**
   - Service patterns: `src/services/` - BaseApiService, error handling, retry logic
   - Component patterns: `src/components/` - Material-UI, TypeScript, established layouts
   - Hook patterns: `src/hooks/` - TanStack Query, custom hooks, state management
   - Utility patterns: `src/services/errorHandling.ts`, `src/services/api.ts`

2. **Task-Specific Context**
   - Map each task to existing files and established patterns
   - Identify required imports, dependencies, and integration points
   - Note project constraints: Docker environment, no `npm run dev`, production URLs
   - Review existing tests and validation approaches

3. **Pattern Documentation**
   - Document similar implementations found in codebase
   - Note pattern variations needed for specific use cases
   - Identify reusable services, hooks, and utilities
   - Record project-specific conventions and standards

### Context Handoff to Subagents
Provide subagents with:
```markdown
**Existing Code Examples**: [Relevant implementations from codebase]
**Required Dependencies**: [Imports, services, hooks to use]
**Project Patterns**: [Established conventions to follow]
**Success Criteria**: [Specific validation steps and expected outcomes]
**Environment Notes**: [Docker constraints, API URLs, testing approaches]
```

---

## ERROR HANDLING PLAYBOOK

### API Integration Failures
**Symptoms**: 404, 401, 500 errors during testing
**Solutions**: 
1. Verify endpoint URLs: `https://api.cedarheightsmusicacademy.com/api/v1/`
2. Check authentication: JWT token format and Authorization header
3. Test with curl first: `curl -H "Authorization: Bearer [TOKEN]" [ENDPOINT]`
4. Validate request/response data structures against existing patterns

### Pattern Mismatch Issues
**Symptoms**: Code doesn't follow existing patterns, TypeScript errors
**Solutions**:
1. Re-examine similar implementations: `codebase_search("similar functionality")`
2. Review existing service/hook patterns in `src/services/`, `src/hooks/`
3. Check import patterns and TypeScript interfaces
4. Validate against project coding standards in `.roo/rules/rules.md`

### Dependency Conflicts
**Symptoms**: Import errors, circular dependencies, type mismatches
**Solutions**:
1. Review existing import patterns in similar components
2. Check for circular dependencies in service layer
3. Verify TypeScript interface compatibility
4. Update imports to match established project structure

---

## PROGRESS TRACKING

### Task Group Milestones
For each group, verify:
- [ ] Context gathered and patterns identified
- [ ] Implementation approach validated against existing code
- [ ] Core functionality implemented using established patterns
- [ ] Error handling added following project conventions
- [ ] Integration tested with real backend/data
- [ ] Documentation updated in outcome.md
- [ ] Success criteria met and validated

### Overall Progress Indicators
- Task groups completed: X/Y
- Critical path items: Status and dependencies
- Blocked items: Count, reasons, and resolution plans
- Quality metrics: Tests passing, patterns followed, integration verified

---

## QUICK REFERENCE

### Essential Commands
```bash
codebase_search("functionality")  # Find patterns FIRST
switch_mode('orchestrator')       # For task group delegation  
new_task('code', 'instructions')  # Delegate with full context
update_todo_list                  # Track progress milestones
```

### Success Checklist
- [ ] ALL tasks from {{FILE}} identified and grouped logically
- [ ] Each group has complete context and established patterns
- [ ] All groups delegated with comprehensive instructions
- [ ] Outcomes documented in {{FILE_DIRECTORY}}/outcome.md
- [ ] No tasks left unaddressed or incomplete

### Red Flags ⚠️
- Creating new tasks instead of implementing existing ones
- Stopping after only a few task groups  
- Missing context or patterns in delegation instructions
- Incomplete outcome documentation
- Not using `codebase_search` for new code exploration

### Environment Reminders
- **Docker Environment**: Never use `npm run dev` - use deploy/test production
- **API Base URL**: `https://api.cedarheightsmusicacademy.com`
- **Server Check**: `curl -s -o /dev/null -w "%{http_code}" http://localhost:5173`
- **Pattern Priority**: Always use existing services, hooks, and utilities

---

## EXECUTION COMMITMENT

**I COMMIT TO:**
- Processing **EVERY SINGLE TASK** through organized, logical groups
- Using **ESTABLISHED PATTERNS** and existing codebase implementations
- **NOT STOPPING** until all task groups are completed or documented as blocked
- **DOCUMENTING OUTCOMES** comprehensively for each task group
- **VALIDATING SUCCESS** against defined criteria before proceeding

**EXECUTION PROTOCOL:**
1. Read {{FILE}} completely → Identify ALL pre-defined tasks
2. Group tasks logically → Use established patterns and dependencies  
3. Switch to orchestrator → Delegate with comprehensive context
4. Process ALL groups → Document outcomes systematically
5. Verify completion → Ensure no tasks remain unaddressed

---

**Begin execution by reading {{FILE}}, grouping ALL tasks, and switching to orchestrator mode.**
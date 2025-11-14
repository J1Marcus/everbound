# tasks_generate_backend.md
---

You are given a Work Breakdown Structure (WBS) document. {{doc}}
Your job is to expand it into a **treed tasklist** organized by the **Three-Stage Rapid Backend Development Framework**, where every branch continues until it produces **atomic tasks** — each being a single coherent action with one clear output.

---

## Three-Stage Backend Development Framework

### **Stage 1: CORE – Foundation & Test Harness**
- Core backend infrastructure, configuration, and tooling  
- API endpoints powered by deterministic **test scaffolds** (no mock data)  
- Database models and repositories with **seed data** for reproducible tests  
- Test authentication and authorization flows  
- **Testing:** Unit tests for core logic + minimal integration tests  
- **Goal:** Demonstrate API functionality and data flow using test harnesses and seed data  

---

### **Stage 2: INTEGRATION – Real Data & Services**
- API with real database connections and persistent storage  
- Integration with external providers/libraries (auth, messaging, storage, etc.)  
- Real data processing with validation and error handling  
- Background jobs and workflow orchestration  
- Complete authentication and authorization  
- **Testing:** Integration tests, workflow tests, API endpoint tests  
- **Goal:** Functional backend system processing real data with stable integrations  

---

### **Stage 3: POLISH & PERFORMANCE – Production Readiness**
- CI/CD automation, versioning, and performance testing  
- Production deployment configuration and observability (monitoring, alerting, logging)  
- Security hardening and compliance validation  
- Performance optimization and scalability improvements  
- **Testing:** E2E, load, and security testing  
- **Goal:** Secure, observable, production-ready backend system  

---

## Rules for Expansion

1. **Three-Stage Hierarchical Numbering**  
   - Use `Stage.Phase.Task.Subtask.Atomic` format (e.g., `1.2.3.4.5`)  
   - Stage 1 = CORE, Stage 2 = INTEGRATION, Stage 3 = POLISH  
   - Preserve the WBS structure within each stage, extending numbering to atomic depth.  

2. **Atomic Definition**  
   - An atomic task is a **singular, indivisible action** producing a single clear output.  
   - Valid examples:  
     - `Create UserRepository class in app/database/repositories/user_repository.py with seed data support`  
     - `Replace test auth flow with JWT implementation in app/core/auth_service.py`  
     - `Add integration test for user registration workflow`  
     - `Run pytest and output summary of failing tests`  
     - `Generate issue_resolving.md by calling error_solving MCP and logging prompt`  

3. **Multi-Pass Refinement**  
   - Perform **multiple passes** through the WBS {{doc}} to ensure **all tasks are captured** across all stages.  
   - Perform **multiple passes** through the task_list.md (`ai_docs/tasks/tasks_list.md`) until all leaf nodes are atomic.  
   - Any node with more than one action must be decomposed further.  

4. **Stage-Aware Dependencies**  
   - Each Stage, Phase, Task, and Subtask must include:  
     - `Dependencies: [list]`  
     - `Stage Gate: [requirements to proceed to next stage]`  
   - Use logical sequencing if dependencies aren’t explicit in the WBS.  

5. **Stage-Specific Validation, Verification, and Documentation**  
   - Append the following atomic actions at the end of each Task (the parent grouping of atomic tasks):  
     - **Stage 1:**  
       - `Validate core functionality of Task X.Y` → *Confirm task implementation complies with core documentation, established patterns, and known anti-patterns.*  
       - `Verify Task X.Y` → *Confirm code compiles successfully and contains no blocking syntax or build issues.*  
       - `Document Task X.Y implementation`  
     - **Stage 2:**  
       - `Validate integration of Task X.Y` → *Confirm compliance with integration conventions and system interaction guidelines.*  
       - `Verify Task X.Y` → *Confirm integrated code compiles and runs without blocking syntax or build issues.*  
       - `Document Task X.Y integration results`  
     - **Stage 3:**  
       - `Validate production readiness of Task X.Y` → *Confirm compliance with production architecture, performance, and security standards.*  
       - `Verify Task X.Y` → *Confirm production build compiles and deploys with no blocking errors.*  
       - `Document Task X.Y production deployment`  

6. **Output Format**  
   - Output as a **Markdown tree** with hierarchical numbering and clear dependency/stage-gate notes.  
   - Each atomic action must be a single developer instruction, precise and self-contained.  

---

## Output Example

### **Stage 1: CORE – Foundation & Test Harness**
(Dependencies: None  |  Stage Gate: Core functionality proven with seed data and passing unit tests)

1.1 Backend Foundation (Dependencies: None)  
  1.1.1 Configure Python development environment (pytest, ruff, mypy)  
  1.1.2 Scaffold project structure (`app/api`, `app/core`, `app/db`, `app/services`)  
  1.1.3 Initialize Docker dev environment with SQLite or in-memory DB  
  1.1.4 Create `.env.example` and configuration loader  

1.2 Test Harness Implementation (Dependencies: 1.1)  
  1.2.1 Write database seed scripts for reproducible local testing  
  1.2.2 Implement base API endpoints returning seeded data  
  1.2.3 Add health-check and version endpoints  
  1.2.4 Configure logging and error-handling middleware  

1.2.A **Validate** core functionality of Task 1.2 *(compliance with docs & patterns)*  
1.2.B **Verify** Task 1.2 *(compiles with no blocking syntax issues)*  
1.2.C Document Task 1.2 implementation in `task_outcomes.md`  

---

### **Stage 2: INTEGRATION – Real Data & Services**
(Dependencies: Stage 1 complete  |  Stage Gate: Backend stable with live integrations)

2.1 Service Integration (Dependencies: 1.2)  
  2.1.1 Replace test auth with real JWT/OAuth provider integration  
  2.1.2 Implement persistent DB migrations and ORM layer  
  2.1.3 Add full error handling and transaction rollback  
  2.1.4 Integrate background jobs and queues  

2.1.A **Validate** integration of Task 2.1 *(compliance with integration standards)*  
2.1.B **Verify** Task 2.1 *(can compile and has no blocking syntax issues)*  
2.1.C Document Task 2.1 integration results  

---

### **Stage 3: POLISH & PERFORMANCE – Production Readiness**
(Dependencies: Stage 2 complete  |  Stage Gate: Production deployment validated)

3.1 Production Readiness (Dependencies: 2.1)  
  3.1.1 Configure CI/CD with coverage and lint checks  
  3.1.2 Deploy monitoring (Prometheus, Grafana, or equivalent)  
  3.1.3 Implement security scanning and compliance checks  
  3.1.4 Optimize DB queries, caching, and connection pooling  

3.1.A **Validate** production readiness of Task 3.1 *(compliance with performance and security standards)*  
3.1.B **Verify** Task 3.1 *(builds and deploys with no blocking syntax issues)*  
3.1.C Document Task 3.1 production deployment  

---

Store results in:  
- `ai_docs/tasks/tasks_list.md`  
- `ai_docs/tasks/task_outcomes.md`  
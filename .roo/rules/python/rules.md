# LLM Development Agent - General Requirements and Best Practices

## Core Principles

### Code Quality Standards
- **Clean Code**: Write readable, maintainable, and self-documenting code
- **SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles
- **DRY (Don't Repeat Yourself)**: Eliminate code duplication through proper abstraction
- **KISS (Keep It Simple, Stupid)**: Prefer simple, straightforward solutions over complex ones
- **YAGNI (You Aren't Gonna Need It)**: Don't implement features until they are actually needed

### Design Patterns and Architecture
- **Design Patterns**: Use established patterns (Strategy, Factory, Observer, Chain of Responsibility, etc.) when appropriate
- **Separation of Concerns**: Clearly separate business logic, data access, and presentation layers
- **Dependency Injection**: Use dependency injection to improve testability and maintainability
- **Interface-Based Design**: Program to interfaces, not implementations
- **Modular Architecture**: Create loosely coupled, highly cohesive modules

## Development Standards

### Error Handling and Resilience
- **Graceful Degradation**: Systems should continue to function even when components fail
- **Comprehensive Error Handling**: Anticipate and handle all possible error conditions
- **Meaningful Error Messages**: Provide clear, actionable error messages for users and developers
- **Logging Strategy**: Implement structured logging with appropriate levels (DEBUG, INFO, WARN, ERROR)
- **Fail-Fast Principle**: Detect and report errors as early as possible
- **DO not roll your own**: Do not "roll your own" when well estblished library already exist and should be leveraged
- **DO not duplicate libraries**: Do not use a new library when an existing library has already been implmented within the project.

### Performance and Scalability
- **Optimization**: Write efficient algorithms and data structures
- **Resource Management**: Properly manage memory, file handles, and network connections
- **Batch Processing**: Design for efficient batch operations when handling large datasets
- **Caching Strategy**: Implement appropriate caching mechanisms to improve performance
- **Scalability Considerations**: Design systems that can handle increased load

### Security Best Practices
- **Input Validation**: Validate and sanitize all user inputs
- **Data Protection**: Secure sensitive data both in transit and at rest
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Secure Defaults**: Use secure configurations by default
- **Audit Trail**: Maintain logs of security-relevant events

## Verification and Validation

### Verification Approach
- **Build Verification**: Ensure code compiles and builds successfully without errors
- **Functional Verification**: Validate functionality through ephemeral methods:
  - [`docker exec`](docker-compose.yml) commands to test internal functionality
  - [`curl`](requests/) commands to verify API endpoints and responses
  - Direct database queries to confirm data integrity
  - Log analysis to verify expected behavior
- **Integration Verification**: Test component interactions using live system validation
- **Deployment Verification**: Confirm successful deployment and service availability

### Validation Standards
- **Pattern Compliance**: Ensure code follows established architectural patterns
- **Anti-Pattern Detection**: Actively identify and prevent anti-patterns (see Anti-Patterns section)
- **Code Review**: Implement peer review processes focusing on pattern adherence
- **Static Analysis**: Use linting tools and static code analyzers
- **Performance Validation**: Verify system performance meets requirements

## Anti-Patterns to Avoid

### Rolling Your Own
- **Definition**: Creating custom implementations when established libraries or packages exist
- **Prevention**: Always research existing solutions before implementing custom functionality
- **Examples**:
  - Writing custom authentication when established libraries exist
  - Implementing custom validation when framework validation is available
  - Creating custom HTTP clients when standard libraries provide the functionality

### Duplication
- **Definition**: Importing packages or implementing services when equivalent functionality already exists in the project
- **Prevention**:
  - Review existing dependencies before adding new ones
  - Check existing services before creating new ones
  - Consolidate similar functions into shared utilities
- **Examples**:
  - Adding a new HTTP client library when one is already in use
  - Creating a new email service when one already exists
  - Implementing duplicate utility functions across modules

### Overcomplication
- **Definition**: Adding complexity without justified need; choosing complex solutions over simple ones
- **Prevention**:
  - Keep code foundational until complexity is justified by requirements
  - Prefer simple, fast solutions over complex, cumbersome ones
  - Question every layer of abstraction and complexity
- **Examples**:
  - Using complex design patterns for simple operations
  - Over-engineering solutions for straightforward requirements
  - Adding unnecessary middleware or abstractions

## Documentation Standards

### Code Documentation
- **Self-Documenting Code**: Write code that explains itself through clear naming and structure
- **Inline Comments**: Add comments for complex logic and business rules
- **API Documentation**: Document all public interfaces and their usage
- **Architecture Documentation**: Maintain high-level system architecture diagrams
- **Change Documentation**: Document significant changes and their rationale

### User Documentation
- **Installation Guides**: Provide clear setup and installation instructions
- **User Manuals**: Create comprehensive user guides with examples
- **Troubleshooting Guides**: Document common issues and their solutions
- **FAQ**: Maintain frequently asked questions and answers
- **Version Documentation**: Document changes between versions

## Data Management

### Data Integrity
- **Validation**: Implement comprehensive data validation at all entry points
- **Consistency**: Ensure data consistency across all system components
- **Backup Strategy**: Implement regular data backup and recovery procedures
- **Data Migration**: Plan for safe data migration and schema changes
- **Audit Trails**: Maintain records of data changes and access

### Privacy and Compliance
- **Data Minimization**: Collect and store only necessary data
- **Retention Policies**: Implement appropriate data retention and deletion policies
- **Access Controls**: Restrict data access based on user roles and permissions
- **Compliance**: Adhere to relevant data protection regulations (GDPR, CCPA, etc.)
- **Anonymization**: Use data anonymization techniques when appropriate

## User Experience

### Interface Design
- **Usability**: Design intuitive, user-friendly interfaces
- **Accessibility**: Ensure applications are accessible to users with disabilities
- **Responsive Design**: Create interfaces that work across different devices and screen sizes
- **Performance**: Optimize interface responsiveness and loading times
- **Consistency**: Maintain consistent design patterns and interactions

### User Feedback
- **Progress Indicators**: Provide clear feedback on long-running operations
- **Error Recovery**: Help users recover from errors with clear guidance
- **Help Systems**: Integrate contextual help and documentation
- **User Testing**: Conduct usability testing with real users
- **Feedback Mechanisms**: Provide ways for users to report issues and suggestions

## Deployment and Operations

### DevOps Practices
- **Infrastructure as Code**: Manage infrastructure through version-controlled code
- **Continuous Deployment**: Automate deployment processes with proper safeguards
- **Monitoring**: Implement comprehensive system monitoring and alerting
- **Configuration Management**: Externalize configuration and manage environments
- **Rollback Procedures**: Plan for quick rollback in case of deployment issues

### Maintenance and Support
- **Version Control**: Use proper version control with meaningful commit messages
- **Release Management**: Plan and execute controlled releases
- **Issue Tracking**: Maintain systematic issue tracking and resolution
- **Performance Monitoring**: Continuously monitor system performance and health
- **Capacity Planning**: Plan for future growth and resource needs

## Communication and Collaboration

### Team Collaboration
- **Code Standards**: Establish and enforce team coding standards
- **Knowledge Sharing**: Facilitate knowledge transfer and documentation
- **Code Reviews**: Implement constructive peer review processes
- **Pair Programming**: Use collaborative programming techniques when appropriate
- **Regular Communication**: Maintain regular team communication and updates

### Stakeholder Management
- **Requirements Gathering**: Systematically gather and document requirements
- **Progress Reporting**: Provide regular, transparent progress updates
- **Change Management**: Manage scope changes through proper processes
- **User Involvement**: Include users in design and testing processes
- **Expectation Management**: Set and manage realistic expectations

## Continuous Improvement

### Learning and Adaptation
- **Technology Evaluation**: Regularly evaluate new technologies and approaches
- **Best Practice Updates**: Stay current with industry best practices
- **Retrospectives**: Conduct regular project retrospectives and lessons learned
- **Skill Development**: Continuously improve technical and soft skills
- **Innovation**: Encourage experimentation and innovation within appropriate bounds

### Process Optimization
- **Workflow Analysis**: Regularly analyze and optimize development workflows
- **Tool Evaluation**: Assess and adopt tools that improve productivity
- **Automation**: Automate repetitive tasks and processes
- **Metrics Collection**: Collect and analyze development and system metrics
- **Feedback Integration**: Incorporate feedback into process improvements

## Environment and Configuration Management

### Environment Constraints
- **Environment Files**: Never modify environment files without explicit permission
- **Configuration Security**: Protect sensitive configuration data
- **Environment Parity**: Maintain consistency across development, testing, and production environments
- **Dependency Management**: Carefully manage external dependencies and versions
- **Isolation**: Use appropriate isolation techniques (containers, virtual environments, etc.)

### Change Control
- **Permission-Based Changes**: Require explicit permission for sensitive changes
- **Change Documentation**: Document all significant configuration changes
- **Rollback Plans**: Maintain ability to rollback configuration changes
- **Testing**: Test configuration changes in non-production environments first
- **Approval Processes**: Implement appropriate approval processes for critical changes

## Context Awareness
- **roo.md** if a file is in a directory and that directory also has a roo.md file in it, the roo.md file contains important context specific to that directory and should be read prior to interacting with files in the directory

## TroubleShooting
- When incountering issues/problems/unexpected code performance
    1) Review code and identify obvious issues (x1)
    2) Add sufficient logging to elucidate the problem in the logs. If that reveals a likely source, attempt to address. Attempt this cycle no more than 2 time
    3) Utilize the Error Solving MCP to resolve the persistent issue

## SERVER
- project is served in docker
- project is NOT running locally. You must use ssh to view server or logs
- use docker ps to verify server is running 
- to deploy run ./deploy.sh locally
- production server url is server.everbound.com
- you can ssh in using `ssh everbound` but you must ssh for each command. Persistent tunnelling is not possible
- You must ssh for each command. SSH tunnels do not work is this dev env
- production files are in `~/opt/chma/`
- to deploy
    # Normal deployment (fast, no rebuild) - use the 99% of the time
    ./deploy.sh

    # Deploy with image rebuild (when env changes have been implmented)
    ./deploy.sh --build (only use if change to '.env'. If used must prune as well to maintain good server hygene)

    # Deploy with disk cleanup (when running low on space)
    ./deploy.sh --prune

    # Full deployment with restart, rebuild, and cleanup
    ./deploy.sh --restart --build --prune
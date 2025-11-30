# Changelog

All notable changes to QA Nexus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-11-30

### Added - Phase 7: API Testing (Phase 3 & 4 Implementation - Advanced Features)

#### OpenAPI/Swagger Import (Phase 4 Feature) 🆕
- **OpenAPIImportDialog Component** - Complete OpenAPI/Swagger specification import
  - Dual input modes:
    - **URL Import**: Import directly from remote specification URLs
    - **JSON Content Import**: Paste specification content directly
  - Real-time validation before import with detailed error messages
  - Sample OpenAPI URL included (Swagger Petstore) for quick testing
  - Option to create separate collections by OpenAPI tags
  - Success notifications with import statistics (requests created, collections created)
  - Info card explaining what data gets imported
- **OpenAPI Parser Library** (`src/lib/openapi-parser.ts`)
  - Full OpenAPI 3.x and Swagger 2.x support
  - Parse from URL or JSON string using @apidevtools/swagger-parser
  - Extract all HTTP methods, parameters, request bodies, and authentication
  - Generate example request bodies from JSON schemas with $ref resolution
  - Support for all parameter types (query, path, header)
  - Authentication scheme mapping (Bearer Token, Basic Auth, API Key, OAuth2)
  - Tag-based organization for automatic folder structure
  - Comprehensive validation with detailed error reporting
- **Server Actions for Import**
  - `importOpenAPISpec()` - Import specification with optional tag-based collection separation
  - `getOpenApiSpecs()` - Fetch all imported specifications
  - `deleteOpenApiSpec()` - Remove imported specification
- **Database Support**
  - OpenApiSpec model already exists in schema (prepared in Phase 1)
- **What Gets Imported**
  - All API endpoints with their HTTP methods (GET, POST, PUT, DELETE, etc.)
  - Request parameters (query, path, header parameters)
  - Request bodies with example data generated from schemas
  - Authentication schemes (Bearer Token, Basic Auth, API Key, OAuth2)
  - Response schemas for future validation
  - Organized by tags/folders for easy navigation
- **Integration**
  - Import button integrated into API Testing page
  - Automatic refresh after successful import
  - Full integration with existing request builder and execution pipeline

#### Authentication Configuration
- **AuthConfig Component** - Visual authentication configuration UI
  - Support for 5 authentication methods:
    - Bearer Token: OAuth 2.0 / JWT support
    - Basic Auth: Username and password with auto-encoding
    - API Key: Custom header or query parameter support
    - OAuth 2.0: Client credentials configuration (prepared)
    - AWS Signature: Placeholder for future implementation
  - Password field with show/hide toggle for security
  - Real-time configuration validation
  - Clear descriptions and examples for each auth method
- **Authentication in Request Builder**
  - New Auth tab with full configuration UI
  - Integration with code generator for automatic header addition

#### Assertions Builder
- **AssertionsBuilder Component** - Visual assertion configuration without coding
  - 6 assertion types:
    - Status Code: Validate HTTP response status
    - Response Time: Assert response timing < threshold
    - Header Value: Check specific response headers
    - JSON Path: Validate response body values using path notation
    - Schema Validation: Placeholder for JSON Schema validation
    - Custom Code: Raw Playwright assertion code
  - Flexible operators: EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, GREATER_THAN, LESS_THAN, MATCHES_REGEX, EXISTS, NOT_EXISTS
  - Enable/disable individual assertions without removal
  - Drag handle for future reordering capability
  - All enabled assertions must pass for test to succeed
- **Generated Code Integration**
  - Assertions automatically converted to Playwright expect() statements
  - Support for JSON parsing when JSON path assertions are used

#### Pre-Request Scripts
- **PreRequestEditor Component** - JavaScript editor for pre-request setup logic
  - Full JavaScript support for complex setup
  - Available functions: console.log(), Date.now(), Math.*, JSON.*, crypto.*
  - Common examples provided:
    - Generate UUIDs: crypto.randomUUID()
    - Calculate timestamps: Math.floor(Date.now() / 1000)
    - Set authorization headers: var headers = {...}
    - Generate random IDs: Math.random().toString(36)
  - Function reference documentation
  - Syntax highlighting ready for future enhancement
  - Pre-request script runs before each request execution

#### Code Generator Updates
- **Authentication Header Generation**
  - Bearer token auto-formatted: `Authorization: Bearer {token}`
  - Basic auth auto-encoded: `Authorization: Basic base64(username:password)`
  - API key support in headers or query parameters
  - Integration with request builder headers
- **Assertion Code Generation**
  - Automatic Playwright expect() generation from assertion config
  - JSON path assertions parse response body automatically
  - Multiple assertion support in single test
- **Pre-Request Script Integration**
  - Pre-request code inserted at beginning of test
  - Proper indentation in generated Playwright code

#### UI Components Created
- `src/components/api-testing/auth-config.tsx` - Authentication configuration UI
- `src/components/api-testing/assertions-builder.tsx` - Assertions builder UI
- `src/components/api-testing/pre-request-editor.tsx` - Pre-request script editor

#### Server Actions & API Updates
- Updated `createApiRequest()` to accept auth, assertions, and pre-request script
- Updated `updateApiRequest()` to handle new Phase 3 fields
- Enhanced request persistence with new configuration options

#### Database Schema Updates
- Added `authType` field to ApiRequest model (NONE, BEARER_TOKEN, BASIC_AUTH, API_KEY, OAUTH2, AWS_SIGNATURE)
- Added `authConfig` JSON field for authentication configuration
- Added `assertions` JSON array field for request assertions
- Added `preRequestScript` text field for pre-request JavaScript code

#### UX Improvements
- Request builder tabs expanded from 4 to 6 tabs (Auth, Assertions, Pre-Request added)
- Each Phase 3 component provides self-contained UI with documentation
- Examples provided for common use cases
- Clear validation and feedback for configuration

### Technical Details
- Playwright code generation now includes authentication header injection
- Assertion operators mapped to Playwright expect() matchers
- Pre-request script indentation handled automatically in code generation
- Full integration with existing request execution pipeline
- Backward compatible with existing requests (defaults to no auth/assertions)

### Documentation
- Created `PHASE3_SUMMARY.md` with detailed implementation guide
- Updated CHANGELOG with Phase 3 details
- Added examples for all 5 authentication methods
- Documented assertion types and operators
- Provided pre-request script examples

## [2.1.0] - 2025-11-30

### Added - Phase 7: API Testing (Phase 2 Implementation)

#### Environment Management
- **Environment Manager Component** - Full CRUD interface for managing environments
  - Create environments with JSON variable configuration
  - Edit existing environments with inline editing
  - Delete environments with confirmation
  - Visual variable display with key-value cards
  - Variable count badges
- **Environments Page** - Dedicated page at `/api-testing/environments`
  - Empty state with helpful guidance
  - Real-time updates after changes

#### Collection Execution
- **Collection Runner Component** - Execute all requests in a collection
  - Modal dialog with real-time progress
  - Sequential execution of all requests
  - Summary statistics (Total, Passed, Failed, Errors)
  - Detailed results list with status icons and response times
  - Re-run capability
  - Error display for failed requests
- **Sidebar Integration** - "Run Collection" button for each collection
  - Hover-based visibility
  - Disabled state for empty collections
  - Auto-refresh after execution

#### UI Components Created
- `src/components/api-testing/environment-manager.tsx` - Environment CRUD interface
- `src/components/api-testing/collection-runner.tsx` - Collection execution dialog
- `src/app/api-testing/environments/page.tsx` - Environments page
- `src/app/api-testing/environments/client.tsx` - Client component with state management

#### UX Improvements
- Status badges with color coding (green/red/orange)
- Progress indicators during execution
- Toast notifications for all operations
- Empty states for better onboarding
- Hover-based actions in collections sidebar

## [2.0.0] - 2025-11-30

### Added - Phase 7: API Testing (Phase 1 Implementation)

#### Database Schema
- **New Models**: ApiCollection, ApiRequest, ApiExecution, Environment, OpenApiSpec, ApiAssertion
- **New Enums**: HttpMethod, BodyType, AuthType, ExecutionStatus, AssertionType, AssertionOperator
- **Relations**: Integrated with User, TestCase models for complete traceability
- **Indexing**: Comprehensive indexes for performance optimization

#### Core API Testing Features
- **Request Builder UI**
  - Visual interface for creating API requests
  - Support for all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
  - Tabbed configuration for Query Params, Headers, Body, and Auth
  - Multiple body types: JSON, Form Data, Form URL Encoded, Raw, Binary
  - Real-time request execution with Playwright
  - Response viewer with status, timing, body, and headers
  - Generated Playwright code viewer with copy functionality

- **Collections Management**
  - Hierarchical folder structure for organizing API requests
  - Create, rename, and delete collections
  - Request count badges
  - Quick execution from collection view
  - Drag-and-drop organization (UI ready)

- **Environment Management**
  - Multiple environment support (Development, Staging, Production)
  - Variable substitution with {{variableName}} syntax
  - Secure storage for sensitive values
  - Per-request or per-collection environment selection

- **Playwright Integration**
  - Dynamic Playwright test code generation from request configurations
  - Automatic test file creation and cleanup
  - JSON test results parsing
  - Response time tracking
  - Assertion support (status code, response time, JSON path, headers)
  - Artifact collection (screenshots, videos, traces)

- **Execution History**
  - Complete audit trail of all test executions
  - Status tracking (PASSED, FAILED, ERROR, SKIPPED, RUNNING)
  - Response time metrics
  - User attribution
  - Environment tracking
  - Re-run failed tests

#### Server Actions & API
- `createCollection`, `getCollections`, `deleteCollection` - Collection management
- `createApiRequest`, `updateApiRequest`, `getApiRequest`, `deleteApiRequest` - Request CRUD operations
- `executeApiRequest` - Single request execution with Playwright
- `executeCollection` - Batch execution of all requests in a collection
- `getExecutionHistory` - Historical execution data
- `createEnvironment`, `getEnvironments`, `updateEnvironment`, `deleteEnvironment` - Environment management
- `getApiTestingStats` - Dashboard statistics and metrics

#### Utilities & Libraries
- **playwright-generator.ts**: Converts API request configs to Playwright test code
  - Variable replacement engine
  - Assertion code generation
  - Multi-format body support
  - Timing instrumentation
- **playwright-executor.ts**: Executes Playwright tests and parses results
  - Dynamic test file generation
  - Parallel and sequential execution modes
  - Result parsing from JSON reporter
  - Error handling and artifact collection

#### UI Components
- **RequestBuilder**: Comprehensive request configuration and execution UI
- **CollectionsSidebar**: Hierarchical collection and request navigation
- **API Testing Page**: Main application page with full-height layout

#### Navigation
- Added "API Testing" link to main navigation with Network icon
- Dedicated `/api-testing` route

#### Technical Implementation
- Full TypeScript support with strict mode
- Prisma ORM with SQLite database
- Next.js 15 Server Components and Client Components architecture
- shadcn/ui component library integration
- Real-time updates with server action revalidation
- Toast notifications for user feedback

### Documentation
- Created comprehensive `PLAYWRIGHT_API_TESTING_PLAN.md` with 6-phase roadmap
- Updated README.md with API Testing features
- Architecture diagrams and implementation examples

### Future Phases (Planned)
- **Phase 2**: Advanced authentication flows (OAuth2, Bearer tokens, API keys)
- **Phase 3**: Request chaining and dynamic variables from responses
- **Phase 4**: AI-powered test generation from OpenAPI specs
- **Phase 5**: Hybrid UI + API testing
- **Phase 6**: Performance testing and monitoring

## [1.0.0] - 2025-11-27

### Added

#### Core Features
- **Test Case Management**
  - Create test cases with title, description, steps, and expected results
  - Priority levels: Low, Medium, High, Critical
  - Status tracking: Active, Draft, Deprecated
  - JSON-based step storage for flexibility
  - List view with sortable table
  - Color-coded priority badges

- **Test Suite Management**
  - Create and organize test suites
  - Group related test cases
  - Card-based grid layout
  - Test case count badges
  - Description and metadata support

- **Test Run Execution**
  - Create test runs with multiple test cases
  - Interactive checkbox selection for test cases
  - Execute individual test cases with detailed dialog
  - Record results: Pass, Fail, Blocked, Skipped, Pending
  - Progress tracking with visual progress bar
  - Add notes and evidence (URLs) to test results
  - Real-time status updates with color-coded icons
  - "Log Defect" button for failed tests

- **Defect Management**
  - Create and track defects
  - Link defects to test results
  - Jira issue ID integration
  - Priority levels matching test cases
  - Status workflow: Open, In Progress, Resolved, Closed
  - Full defect listing with linked test cases
  - External link indicator for Jira issues

- **Dashboard & Metrics**
  - Real-time statistics on home page
  - Total test cases with active count
  - Total test runs with pass rate percentage
  - Total defects with open count
  - Total test suites count
  - Quick action cards for all modules
  - Gradient hero text
  - Hover effects on cards

#### UI/UX
- Global header navigation with logo
- Responsive design for all screen sizes
- Consistent Shadcn UI components throughout
- Color-coded status indicators
- Icon-based navigation
- Loading states for async operations
- Error handling in forms

#### Technical
- Next.js 14 with App Router
- TypeScript strict mode
- Shadcn UI component library
- Tailwind CSS for styling
- Prisma ORM v7 with SQLite
- Server Actions for API
- Type-safe database queries
- Proper client/server component separation

#### Database
- User model with roles (Admin, Manager, Tester, Developer)
- TestCase model with priority and status
- TestSuite model for organization
- TestRun model for execution tracking
- TestResult model for individual results
- Defect model with Jira integration
- Database migrations
- Seed script for demo data

#### Documentation
- Comprehensive README.md
- Product Requirements Document (prd.md)
- Project rules (contest.md)
- Implementation plan
- Database schema documentation

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- Prisma client singleton to prevent connection leaks
- Type-safe database queries
- Server-side validation

---

## [1.1.0] - 2025-11-27

### Added

#### AI Features
- **AI Test Case Generator**
  - Generate comprehensive test cases from natural language requirements
  - Options for edge cases and negative scenarios
  - Preview and edit generated cases before saving
  - Powered by OpenAI GPT-4

- **AI Q&A Assistant**
  - Floating chat widget for querying test data
  - Context-aware answers about test runs, defects, and coverage

#### Integrations
- **Advanced Jira Integration**
  - Settings page for configuring Jira credentials (URL, Email, API Token)
  - Bi-directional synchronization of issues
  - One-click bug creation from failed test executions
  - Automatic linking of Jira issues to Test Results and Defects

#### UI/UX
- New Settings page
- AI Chat Widget in global layout
- "AI Generate" button in Test Cases page
- "Create Jira Issue" workflow in Test Execution dialog

#### Automation & Analytics
- **Playwright Integration**
  - Automated test execution support
  - Result import script (`scripts/import-results.ts`)
  - Auto-creation of test cases from automation
  - Automation status tracking

- **Analytics Dashboard**
  - New `/analytics` page
  - Interactive charts for execution history
  - Defect breakdown visualization
  - Automation coverage stats

#### Content Import
- **Jira Epic Import**
  - Fetch Epics from Jira
  - Generate Test Plans (Suites) from Epic details
  - AI-driven test case generation from stories

- **Confluence Integration**
  - Connect to Confluence Cloud
  - Search and import pages
  - Generate test cases from design documents

## [1.2.0] - 2025-11-29

### Added

#### Requirements Traceability
- **Document Analysis**
  - AI-powered analysis of Jira Epics and Confluence Pages
  - Automatic identification of risks with severity levels (Critical, High, Medium, Low)
  - Gap detection in requirements and test coverage
  - Missed requirements highlighting
  - AI recommendations for quality improvement
  - Complete analysis reports with navigable links

- **Coverage Tracking**
  - Test cases now tagged with specific risks, gaps, and requirements they address
  - `coversRisks`, `coversGaps`, `coversRequirements` fields added to TestCase model
  - Enhanced AI test generation with automatic coverage tagging
  - Full traceability from requirements to test cases

- **Coverage Matrix**
  - Visual traceability matrix showing requirement → test case mappings
  - Coverage percentage calculations
  - Gap identification (uncovered requirements highlighted in red)
  - Bi-directional navigation between requirements and test cases
  - Real-time coverage metrics

- **Traceability Badges**
  - Visual indicators showing Epic → Suite connections
  - Links to analysis reports from test suite detail pages
  - Document analysis source tracking throughout the platform

#### Test Automation
- **Playwright Test Generation**
  - AI-powered conversion of manual test cases to Playwright automation code
  - Readiness validation (ensures 100% pass rate before generation)
  - Production-ready TypeScript code with best practices
  - Role-based selectors and proper assertions
  - Configurable base URL for different environments
  - Downloadable `.spec.ts` files
  - Automation status tracking in test cases

- **Automation Generator Component**
  - Integrated into test suite detail pages
  - Readiness check with pass rate visualization
  - Code preview with syntax highlighting
  - Copy to clipboard and download functionality
  - Setup instructions for Playwright
  - Automatic marking of test cases as automated

### Changed

- **Test Suite Detail Page**
  - Added "Automated Test Generation" section
  - Integrated AutomationGenerator component
  - Shows traceability badges (Jira Epic, Analysis Report)
  - Fixed 404 error when executing tests (now creates test runs properly)

- **Document Analysis Flow**
  - Now generates test cases with coverage tags
  - Uses enhanced AI for intelligent requirement mapping
  - Shows coverage matrix after test suite generation

- **Header Navigation**
  - Added "Analysis" menu item linking to document analysis

- **AI Integration**
  - Improved prompt engineering for better test generation
  - Direct code generation instead of JSON wrapping (eliminates escaping issues)
  - Better error handling and fallback mechanisms
  - Support for both OpenAI and Foundry providers

- **Database Schema**
  - Added `coversRisks`, `coversGaps`, `coversRequirements` JSON fields to TestCase
  - Added `documentAnalysis` relation to TestSuite
  - Added `testSuiteId` to DocumentAnalysis for bidirectional linking

### Fixed

- **Test Execution 404 Error**
  - Fixed navigation error when clicking "Execute" in test suite
  - Changed from individual test execution to creating test runs for entire suite
  - Proper redirect to test run detail page

- **Playwright Generation JSON Parsing**
  - Eliminated JSON escaping issues by generating code directly
  - Added robust error handling for AI responses
  - Placeholder tests generated for failed AI generations (using `test.skip`)
  - Better logging of parsing errors for debugging

- **Next.js 16 Compatibility**
  - Fixed `params` Promise handling in dynamic routes
  - Updated all route handlers to await params

### Documentation

- **Complete README Rewrite**
  - Added comprehensive overview section
  - Detailed key features breakdown
  - AI provider configuration instructions
  - Core workflows documentation (4 detailed workflows)
  - Requirements traceability section with examples
  - Test automation section with code examples
  - Updated project structure
  - Complete database schema documentation
  - API documentation for server actions
  - Deployment guides for Vercel, Docker, and CI/CD

## [2.0.0] - 2025-11-30

### Added - Phase 5: Collaboration Features

#### Team Collaboration
- **Comments System**
  - Add comments to test cases, test suites, and defects
  - Threaded replies for better conversation organization
  - Edit and delete own comments
  - Real-time comment display
  - User avatars with initials

- **Notifications System**
  - Bell icon in header showing unread count
  - Popover notification center with recent notifications
  - Notification types: mentions, comment replies, review requests, review completion, status changes
  - Mark individual notifications as read
  - Mark all notifications as read at once
  - Auto-polling for new notifications (30s interval)
  - Click notifications to navigate to related entities

- **Review Workflows**
  - Request reviews from team members on test cases and suites
  - Assign reviewers with optional comments
  - Review statuses: Pending, In Review, Completed, Cancelled
  - Review decisions: Approved, Rejected, Needs Changes
  - Review completion with comments
  - Automatic notifications for review requests and completions
  - Review history tracking

- **@Mentions Functionality**
  - Mention users in comments with @ syntax
  - Automatic notification creation for mentioned users
  - Visual mention indicators
  - Support for multiple mentions per comment

- **Activity Timeline**
  - Visual activity log with timeline design
  - Track all actions: created, updated, deleted, commented, reviewed
  - Color-coded activity icons
  - User attribution for all activities
  - Relative timestamps (e.g., "2h ago")
  - Entity-specific activity filtering
  - Activity change tracking with before/after values

#### UI Enhancements
- **Test Case Detail Page** (`/test-cases/[id]`)
  - Full test case details with coverage information
  - Comments section
  - Review panel in sidebar
  - Activity timeline in sidebar
  - Clickable test case rows in list view

- **Test Suite Detail Page Updates**
  - Comments section added
  - Review panel added
  - Activity timeline added
  - Better layout with collaboration features

- **Header Updates**
  - Notifications bell with badge counter
  - Server-side rendering for user context

#### Database Schema Updates
- **New Models**:
  - `Comment`: Supports polymorphic comments on test cases, suites, and defects with threading
  - `Notification`: User notifications with types and read status
  - `Review`: Review workflows with status and decision tracking
  - `ActivityLog`: Comprehensive activity tracking for all entities
  - Added collaboration relations to existing models

- **New Enums**:
  - `NotificationType`: MENTION, COMMENT_REPLY, REVIEW_REQUESTED, REVIEW_COMPLETED, TEST_ASSIGNED, DEFECT_ASSIGNED, STATUS_CHANGE
  - `ReviewStatus`: PENDING, IN_REVIEW, COMPLETED, CANCELLED
  - `ReviewDecision`: APPROVED, REJECTED, NEEDS_CHANGES

#### Server Actions
- **comments.ts**: Create, read, update, delete comments with notification triggers
- **notifications.ts**: Manage notifications and unread counts
- **reviews.ts**: Handle review lifecycle from creation to completion
- **activity.ts**: Log and retrieve activity logs across all entities

### Changed
- Updated database schema with collaboration models
- Enhanced test case list to link to detail pages
- Header component now async for fetching user data
- Added missing UI components (Avatar, Popover, ScrollArea)

### Technical
- Added comprehensive indexes for collaboration queries
- Cascade delete support for maintaining data integrity
- Optimized notification polling strategy
- Activity logging integrated throughout action layer

## [3.0.0] - 2025-11-30

### Added - Phase 6: Advanced AI Features

#### Flaky Test Detection
- Automatic detection analyzing test execution history
- Flaky score (0-100) based on result variance
- Pattern analysis detecting flip-flopping behavior
- Reviews last 20 executions over 30 days
- Confidence scoring based on data sample size

#### Predictive Analytics
- Failure prediction for next test run
- Trend analysis of recent failures
- Risk scoring (0-100 probability)
- Early warning for increasing failure rates
- Uses 7-day execution history

#### Performance Analysis
- Slow test detection (>30s threshold)
- Execution time tracking and analysis
- Optimization recommendations
- Severity grading by impact

#### AI-Powered Recommendations
- Smart suggestions for test quality
- Coverage analysis and gap identification
- Optimization opportunities
- Pattern recognition and anomaly detection

#### Test Prioritization
- Smart test ordering based on multiple factors
- Risk-based prioritization
- Flakiness consideration
- Priority weighting (CRITICAL, HIGH, etc.)

#### AI Insights Dashboard
- Centralized view of all AI insights
- Summary cards for quick overview
- Filtering by insight type
- Resolution tracking
- Confidence indicators
- Entity linking to tests

### Database Schema
- Added AIInsight model with 7 insight types and 4 severity levels
- Enhanced TestCase with flakyScore, failurePrediction, executionTime
- Comprehensive indexes for performance

### Server Actions & Library
- ai-insights.ts: Full AI insights management
- ai-insights library: Core analysis engine

## [Unreleased]

### Planned for Future Phases
- Real-time AI insights updates
- Visual regression testing
- AI-powered test healing
- Advanced pattern recognition

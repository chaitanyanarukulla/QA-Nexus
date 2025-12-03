#!/usr/bin/env python3
"""
QA Nexus Jira Project Creator - Fixed for Atlassian Document Format
Creates all 11 Epic tickets for the existing QA Nexus (QANEX) project.

Requirements:
    pip3 install requests

Usage:
    python3 create_jira_epics.py
"""

import requests
import json
import time
from requests.auth import HTTPBasicAuth

# Jira Configuration
JIRA_CONFIG = {
    'base_url': 'https://your-domain.atlassian.net',
    'email': 'your-email@example.com',
    'api_token': 'your-api-token',
    'project_key': 'QANEX'  # Your existing project
}

def text_to_adf(text):
    """Convert plain text to Atlassian Document Format"""
    lines = text.strip().split('\n')
    content = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if it's a bold header (starts with *)
        if line.startswith('*') and line.endswith('*') and len(line) > 2:
            # Bold text
            inner_text = line.strip('*')
            content.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": inner_text,
                        "marks": [{"type": "strong"}]
                    }
                ]
            })
        elif line.startswith('- '):
            # Bullet point
            content.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": line[2:]
                    }
                ]
            })
        elif line[0].isdigit() and line[1:3] in ['. ', ') ']:
            # Numbered list
            content.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": line
                    }
                ]
            })
        else:
            # Regular paragraph
            content.append({
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": line
                    }
                ]
            })
    
    return {
        "version": 1,
        "type": "doc",
        "content": content
    }

# Epic Definitions
EPICS = [
    {
        'name': 'Dashboard & Analytics',
        'summary': 'Dashboard & Analytics',
        'description': """Description: Provide a centralized view of quality metrics, recent activity, and AI insights to help teams make data-driven decisions.

User Stories:
1. View Overall Metrics - As a QA Manager, I want to see total test cases, pass rates, and open defects so that I can gauge project health.
   - Acceptance: Display cards for Total Tests, Pass Rate %, Open Defects, and Automation Coverage %.

2. Analyze Execution Trends - As a Tester, I want to see a chart of test executions over the last 30 days so that I can track testing velocity.
   - Acceptance: Line chart showing Pass/Fail counts by date.

3. View Recent Activity - As a User, I want to see a feed of recent actions (created tests, runs, comments) so that I stay updated.
   - Acceptance: List of last 10 activities with user, action type, and timestamp.

4. Monitor AI Insights - As a Lead, I want to see flaky tests and failure predictions so that I can prioritize maintenance.
   - Acceptance: Dashboard widget listing top 5 risky/flaky tests."""
    },
    {
        'name': 'Test Case Management',
        'summary': 'Test Case Management',
        'description': """Description: Comprehensive management of manual test cases, including creation, editing, organization, and versioning.

User Stories:
1. Create Manual Test Case - As a Tester, I want to create a test case with title, steps, expected results, and priority.
   - Acceptance: Form saves successfully; appears in list; supports rich text or step-by-step input.

2. Edit & Delete Test Cases - As a Tester, I want to update or remove test cases as requirements change.
   - Acceptance: Edit updates DB; Delete removes (or archives) the case.

3. Filter & Search Test Cases - As a User, I want to filter tests by priority, status, and suite.
   - Acceptance: Search bar works; dropdown filters update the list.

4. AI Test Improvement - As a Tester, I want AI to suggest improvements to my test steps for clarity.
   - Acceptance: Improve with AI button updates the description/steps text."""
    },
    {
        'name': 'Test Suite Management',
        'summary': 'Test Suite Management',
        'description': """Description: Grouping test cases into logical suites for organization and batch execution.

User Stories:
1. Create Test Suite - As a Lead, I want to create a suite (e.g., Smoke Test, Regression) and assign test cases to it.
   - Acceptance: Suite creation form; ability to select multiple test cases to add.

2. Link Suite to Jira Epic - As a Manager, I want to link a suite to a Jira Epic Key so that I can track coverage.
   - Acceptance: Input field for Jira Key; fetches Epic details if integration is active.

3. Automation Readiness Check - As an Automation Engineer, I want to check if a suite is ready for automation (all tests passing manually).
   - Acceptance: Visual indicator of % tests passing; Ready for Automation badge."""
    },
    {
        'name': 'Test Execution & Runs',
        'summary': 'Test Execution & Runs',
        'description': """Description: Executing test suites, recording results, and tracking history.

User Stories:
1. Start Test Run - As a Tester, I want to start a new execution run for a specific suite.
   - Acceptance: Creates a TestRun record; status set to In Progress.

2. Execute Test Steps - As a Tester, I want to mark individual test cases as Pass, Fail, or Skipped during a run.
   - Acceptance: Interface to cycle through tests; buttons for status; progress bar updates.

3. Add Evidence & Notes - As a Tester, I want to attach screenshots or notes to a failed test result.
   - Acceptance: Text area for notes; file upload or URL input for evidence.

4. View Run History - As a User, I want to see past execution runs and their outcomes.
   - Acceptance: List of past runs; detail view showing results of each case in that run."""
    },
    {
        'name': 'Defect Management & Jira Integration',
        'summary': 'Defect Management & Jira Integration',
        'description': """Description: Tracking bugs found during testing and syncing them with Jira.

User Stories:
1. Create Defect from Failure - As a Tester, I want to create a defect immediately when a test fails.
   - Acceptance: Create Defect button on failed test result; pre-fills data from test case.

2. Sync with Jira - As a User, I want defects created in QA Nexus to automatically create Jira Issues.
   - Acceptance: Jira Issue created; Jira Key saved in QA Nexus; link provided.

3. Bi-directional Sync - As a User, I want status changes in Jira (e.g., Done) to reflect in QA Nexus.
   - Acceptance: Webhook or polling updates QA Nexus defect status when Jira issue updates."""
    },
    {
        'name': 'AI-Powered Document Analysis',
        'summary': 'AI-Powered Document Analysis',
        'description': """Description: Using AI to analyze requirements documents and generate test assets.

User Stories:
1. Analyze Requirements Text - As a QA Lead, I want to paste requirements or select a Jira Epic to analyze for risks and gaps.
   - Acceptance: AI returns list of Risks (Severity, Impact), Gaps (Category, Suggestion), and Missed Requirements.
   - Implementation: Uses analyzeDocument from src/lib/ai.ts.

2. Generate Test Cases from Analysis - As a Tester, I want to generate a full test suite based on the AI analysis.
   - Acceptance: Generate Tests button creates Test Cases in DB linked to the analysis. Supports edge cases and negative scenarios options.
   - Implementation: Uses generateTestCases from src/lib/ai.ts.

3. Traceability Matrix - As a Manager, I want to see which test cases cover which requirements/risks.
   - Acceptance: Visual matrix showing relationships between Requirements and Test Cases."""
    },
    {
        'name': 'API Testing Platform',
        'summary': 'API Testing Platform',
        'description': """Description: A complete environment for creating, organizing, and running API tests.

User Stories:
1. Visual Request Builder - As a Tester, I want a UI to create HTTP requests (GET, POST, etc.) without writing code.
   - Acceptance: Inputs for URL, Method, Headers, Body, Params; Send button works. Supports variable substitution.

2. Import OpenAPI Spec - As a Developer, I want to import a Swagger/OpenAPI JSON file to automatically create test collections.
   - Acceptance: Upload dialog; parses spec; creates Collections and Requests in DB.

3. AI Request Generation - As a Tester, I want to describe a request in English and have AI build it for me.
   - Acceptance: Generate dialog; input prompt; populates Request Builder fields.
   - Implementation: Uses generateApiRequest from src/lib/ai.ts.

4. AI Assertion Generation - As a Tester, I want AI to analyze a response and suggest validation assertions.
   - Acceptance: Generate Assertions button; adds checks for status code, schema, and data.
   - Implementation: Uses generateApiAssertions from src/lib/ai.ts.

5. Playwright Code Export - As an Automation Engineer, I want to export my API tests as executable Playwright code.
   - Acceptance: Export Code button; generates valid test code block.
   - Implementation: Uses generatePlaywrightTest from src/lib/playwright-generator.ts."""
    },
    {
        'name': 'Collaboration',
        'summary': 'Collaboration',
        'description': """Description: Features enabling team communication and review processes.

User Stories:
1. Comment on Assets - As a User, I want to add comments to test cases, runs, and defects.
   - Acceptance: Comment section on detail pages; supports threading.

2. Request Review - As a Tester, I want to request a peer review for a new test suite.
   - Acceptance: Request Review action; assigns to user; status changes to In Review.

3. Notifications - As a User, I want to be notified when I am mentioned or assigned a review.
   - Acceptance: Notification bell icon; list of unread notifications."""
    },
    {
        'name': 'Settings & Configuration',
        'summary': 'Settings & Configuration',
        'description': """Description: System-wide configuration for AI providers and integrations.

User Stories:
1. Configure AI Provider - As an Admin, I want to switch between OpenAI and Local Foundry LLM.
   - Acceptance: Settings form; API Key input for OpenAI; URL input for Foundry; persists to DB.

2. Configure Jira Connection - As an Admin, I want to set up the Jira URL and API Token.
   - Acceptance: Connection test button; secure storage of tokens."""
    },
    {
        'name': 'AI Insights & Analytics',
        'summary': 'AI Insights & Analytics',
        'description': """Description: Advanced AI features for predictive quality analysis and natural language data querying.

User Stories:
1. Flaky Test Detection - As a Lead, I want to identify tests that frequently toggle between pass/fail.
   - Acceptance: System analyzes execution history; assigns Flaky Score (0-100); alerts user.

2. Failure Prediction - As a Tester, I want to know which tests are likely to fail in the next run.
   - Acceptance: AI model predicts failure probability based on code changes and history.

3. Chat with Data (QA Assistant) - As a Manager, I want to ask questions like How many critical bugs were found last week and get an answer.
   - Acceptance: Chat interface; AI queries database context and returns natural language answer.
   - Implementation: Uses answerQuestion from src/lib/ai.ts."""
    },
    {
        'name': 'Automation Engine',
        'summary': 'Automation Engine',
        'description': """Description: The core engine for generating, executing, and reporting on automated tests.

User Stories:
1. Execute Playwright Tests - As a System, I need to execute generated Playwright scripts in a controlled environment.
   - Acceptance: executePlaywrightTest function runs npx playwright test; captures stdout/stderr.

2. Parse Execution Results - As a System, I need to parse JSON results from Playwright into database records.
   - Acceptance: Maps Playwright JSON report to TestResult and ApiExecution models.

3. Parallel Execution - As a User, I want to run multiple tests simultaneously to save time.
   - Acceptance: Support for Promise.all execution of test batches."""
    }
]


def get_auth():
    """Get HTTP Basic Auth for Jira API"""
    return HTTPBasicAuth(JIRA_CONFIG['email'], JIRA_CONFIG['api_token'])


def get_epic_name_field():
    """Find the Epic Name custom field ID"""
    print("🔍 Finding Epic Name custom field...")
    
    url = f"{JIRA_CONFIG['base_url']}/rest/api/3/field"
    response = requests.get(url, auth=get_auth())
    
    if response.status_code != 200:
        print(f"❌ Failed to get fields: {response.status_code}")
        exit(1)
    
    fields = response.json()
    
    for field in fields:
        if field.get('name') == 'Epic Name' or \
           (field.get('schema') and field['schema'].get('custom') == 'com.pyxis.greenhopper.jira:gh-epic-label'):
            print(f"✅ Found Epic Name field: {field['id']}")
            return field['id']
    
    print("❌ Epic Name field not found")
    exit(1)


def create_epic(project_key, epic_data, epic_name_field_id):
    """Create a single Epic issue with ADF description"""
    url = f"{JIRA_CONFIG['base_url']}/rest/api/3/issue"
    
    issue_data = {
        'fields': {
            'project': {'key': project_key},
            'summary': epic_data['summary'],
            'description': text_to_adf(epic_data['description']),
            'issuetype': {'name': 'Epic'},
            epic_name_field_id: epic_data['name']
        }
    }
    
    response = requests.post(
        url,
        auth=get_auth(),
        headers={'Content-Type': 'application/json'},
        json=issue_data
    )
    
    if response.status_code not in [200, 201]:
        raise Exception(f"Status {response.status_code}: {response.text}")
    
    return response.json()


def main():
    """Main execution function"""
    print("=" * 60)
    print("🚀 QA NEXUS EPIC CREATOR")
    print("=" * 60)
    print(f"Project: {JIRA_CONFIG['project_key']}")
    print(f"URL: {JIRA_CONFIG['base_url']}/browse/{JIRA_CONFIG['project_key']}")
    print()
    
    try:
        # Get Epic Name field
        epic_name_field_id = get_epic_name_field()
        
        # Create all Epics
        print(f"\n📝 Creating {len(EPICS)} Epic tickets...")
        print("-" * 60)
        
        created_epics = []
        
        for i, epic in enumerate(EPICS, 1):
            print(f"\n[{i}/{len(EPICS)}] Creating: {epic['name']}")
            
            try:
                result = create_epic(JIRA_CONFIG['project_key'], epic, epic_name_field_id)
                epic_key = result['key']
                created_epics.append(epic_key)
                print(f"    ✅ Created: {epic_key}")
                print(f"    🔗 {JIRA_CONFIG['base_url']}/browse/{epic_key}")
                
                # Delay to avoid rate limiting
                time.sleep(0.5)
                
            except Exception as e:
                print(f"    ❌ Failed: {str(e)}")
        
        # Summary
        print("\n" + "=" * 60)
        print("🎉 EPIC CREATION COMPLETE!")
        print("=" * 60)
        print(f"\nEpics Created: {len(created_epics)}/{len(EPICS)}")
        
        if created_epics:
            print("\nCreated Epic Keys:")
            for epic_key in created_epics:
                print(f"  • {epic_key} - {JIRA_CONFIG['base_url']}/browse/{epic_key}")
        
        print(f"\n✨ View your board: {JIRA_CONFIG['base_url']}/jira/software/projects/{JIRA_CONFIG['project_key']}/board")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        exit(1)


if __name__ == '__main__':
    main()
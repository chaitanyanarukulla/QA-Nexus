# Phase 3: Automation & Analytics

## Goals
1.  **Playwright Integration**: Bridge the gap between manual and automated testing.
2.  **Advanced Dashboards**: Provide deep insights into quality metrics.

## Implementation Plan

### 1. Playwright Integration
- **Setup**: Install Playwright in the project.
- **Schema Update**: Add `automationId` and `automationFile` to `TestCase` model.
- **Result Import**: Create a custom reporter or script to push Playwright results to QA Nexus.
- **Execution**: (Future) Trigger local Playwright runs from the UI.

### 2. Advanced Dashboards
- **Tech**: Use `recharts` for visualization.
- **New Page**: `/analytics`
- **Metrics**:
    - **Pass/Fail Trend**: Last 30 days execution history.
    - **Defect Distribution**: By Priority and Status.
    - **Flaky Tests**: Tests that flip status frequently.
    - **Automation Coverage**: % of test cases with automation linked.

## Dependencies
- `playwright`
- `recharts`

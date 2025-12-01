# Phase 10: Jira Webhook Integration - Implementation Summary

## Overview
Phase 10 implements real-time bi-directional sync between QA Nexus and Jira using webhooks. When Jira issues are updated, the corresponding defects in QA Nexus are automatically synchronized.

## Features Implemented

### 1. Webhook Endpoint (`/api/webhooks/jira`)
A secure webhook receiver that processes Jira events:

**Supported Events:**
- `jira:issue_created` - Logs new issues for reference
- `jira:issue_updated` - Syncs status and priority changes to linked defects
- `jira:issue_deleted` - Unlinks deleted issues from defects

**Security Features:**
- Optional HMAC signature verification
- Request body validation
- Error logging and audit trail

### 2. Automatic Status Synchronization

**Jira → QA Nexus Status Mapping:**
| Jira Status | QA Nexus Status |
|-------------|-----------------|
| To Do, Open, Backlog, New | OPEN |
| In Progress, In Review, In Development | IN_PROGRESS |
| Resolved, Fixed | RESOLVED |
| Done, Closed, Verified | CLOSED |

**Jira → QA Nexus Priority Mapping:**
| Jira Priority | QA Nexus Priority |
|---------------|-------------------|
| Highest, Blocker, Critical | CRITICAL |
| High, Major | HIGH |
| Medium, Normal | MEDIUM |
| Low, Minor, Trivial | LOW |

### 3. Jira Client Extensions (`/src/lib/jira.ts`)

**New Methods:**
- `getWebhooks()` - List all registered webhooks
- `registerWebhook(data)` - Create a new webhook in Jira
- `deleteWebhook(webhookId)` - Remove a webhook
- `refreshWebhook(webhookId)` - Extend webhook expiration

### 4. Webhook Server Actions (`/src/app/actions/webhooks.ts`)

- `getWebhookUrl()` - Get the webhook endpoint URL
- `getWebhookSettings()` - Retrieve webhook configuration
- `saveWebhookSettings(data)` - Save webhook secret and settings
- `registerJiraWebhook(userId, projectKey?)` - Register webhook with Jira
- `unregisterJiraWebhook(userId)` - Remove webhook from Jira
- `getWebhookLogs(limit)` - Fetch recent webhook events
- `testWebhookEndpoint()` - Verify endpoint is reachable

### 5. Webhook Settings UI (`/src/components/settings/webhook-settings-form.tsx`)

**Features:**
- Display webhook URL with copy button
- Test endpoint connectivity
- Configure webhook secret for security
- Register/unregister webhook with one click
- View monitored event types
- Browse recent webhook event logs
- Status indicator (Active/Inactive)

### 6. Database Models

**Settings Model:**
```prisma
model Settings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  category  String   @default("general")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**WebhookLog Model:**
```prisma
model WebhookLog {
  id           String   @id @default(cuid())
  source       String   // 'jira', 'github', etc.
  eventType    String   // 'issue_updated', etc.
  entityType   String   // 'defect', 'test_case'
  entityId     String
  payload      String   // JSON
  status       String   // 'SUCCESS', 'ERROR'
  errorMessage String?
  processedAt  DateTime @default(now())
}
```

## Files Created

| File | Description |
|------|-------------|
| [route.ts](src/app/api/webhooks/jira/route.ts) | Jira webhook endpoint |
| [webhooks.ts](src/app/actions/webhooks.ts) | Webhook server actions |
| [webhook-settings-form.tsx](src/components/settings/webhook-settings-form.tsx) | Webhook UI component |

## Files Modified

| File | Changes |
|------|---------|
| [jira.ts](src/lib/jira.ts) | Added webhook management methods |
| [page.tsx](src/app/settings/page.tsx) | Integrated webhook settings UI |
| [schema.prisma](prisma/schema.prisma) | Added Settings and WebhookLog models |

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Jira Cloud    │         │   QA Nexus      │
│                 │         │                 │
│  Issue Updated  │────────▶│  /api/webhooks/ │
│                 │  HTTP   │     jira        │
└─────────────────┘  POST   └────────┬────────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │ Event Handler  │
                            │                │
                            │ - Parse event  │
                            │ - Find defect  │
                            │ - Map status   │
                            │ - Update DB    │
                            └────────┬───────┘
                                     │
                                     ▼
                            ┌────────────────┐
                            │   Database     │
                            │                │
                            │ - Defect       │
                            │ - WebhookLog   │
                            │ - JiraIssue    │
                            └────────────────┘
```

## Webhook Event Flow

1. **Issue Created in Jira**
   - Jira sends POST to `/api/webhooks/jira`
   - QA Nexus logs the event
   - No automatic defect creation (manual linking preferred)

2. **Issue Updated in Jira**
   - Jira sends POST with changelog
   - QA Nexus finds linked defect by Jira key
   - Status/priority changes are mapped and applied
   - Defect and JiraIssue records updated
   - Event logged to WebhookLog

3. **Issue Deleted in Jira**
   - Jira sends deletion event
   - QA Nexus clears `jiraIssueId` on linked defect
   - JiraIssue record removed
   - Defect preserved (not deleted)

## Configuration

### Setting Up Webhooks

1. **Navigate to Settings**
   - Go to Settings page in QA Nexus
   - Find "Jira Webhook Integration" section

2. **Configure Jira First**
   - Ensure Jira integration is configured and active

3. **Register Webhook**
   - Click "Register Webhook" button
   - QA Nexus will automatically:
     - Create webhook in Jira
     - Configure event subscriptions
     - Enable bi-directional sync

4. **Optional: Set Secret**
   - Enter a webhook secret for security
   - Configure same secret in Jira webhook settings

### Webhook URL

The webhook URL follows this pattern:
```
{APP_URL}/api/webhooks/jira
```

For local development:
```
http://localhost:3000/api/webhooks/jira
```

For production, set `NEXT_PUBLIC_APP_URL` environment variable.

## Security

### Signature Verification
```typescript
// Verify HMAC signature
const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
```

### Best Practices
- Always use HTTPS in production
- Set a strong webhook secret
- Regularly rotate secrets
- Monitor webhook logs for anomalies

## Monitored Events

| Event | Action |
|-------|--------|
| Issue Created | Logged for audit |
| Issue Updated | Sync status/priority |
| Issue Deleted | Unlink from defect |

## Settings Keys

| Key | Description |
|-----|-------------|
| `jira_webhook_secret` | HMAC secret for verification |
| `jira_webhook_enabled` | Whether sync is active |
| `jira_webhook_id` | Jira webhook ID |
| `jira_webhook_last_sync` | Last successful sync time |

## Build Status
```
✓ Build completed successfully
Route: /api/webhooks/jira (Dynamic)
Route: /settings (Static)
```

## Epic Reference

This implementation fulfills **Epic 5, Story 3** from the design document:

> **Bi-directional Sync**
> *As a User, I want status changes in Jira (e.g., "Done") to reflect in QA Nexus.*
> **Acceptance Criteria**: Webhook or polling updates QA Nexus defect status when Jira issue updates.

## Phase 10 Complete ✅

The Jira Webhook Integration provides:
- Real-time sync from Jira to QA Nexus
- Automatic status and priority mapping
- Secure webhook verification
- Complete audit logging
- Easy setup via Settings UI

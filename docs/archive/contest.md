# Project Rules
- UI Library: Shadcn UI
- CSS: Tailwind
- NEVER remove comments marked "DO NOT DELETE"
- ALWAYS ask for confirmation before installing new npm packages

### 1. The "Reuse First" Policy
Before writing ANY new code, you must:
- **Search existing files** for similar functionality (e.g., "Do we already have a `formatDate` utility?").
- **Import over Create:** If a utility or component exists, import it. Do NOT duplicate logic inline.
- **Pattern Match:** If you must write new code, match the exact style, naming convention, and structure of the adjacent files.
- **No "V2" Files:** Never create files like `auth_v2.ts` or `login_new.tsx`. Modify the existing file or ask for permission to refactor.

### 2. Aggressive Dead Code Removal
- **Zero Zombie Policy:** If you refactor a function and the old version is no longer called, DELETE the old version immediately. Do not comment it out.
- **Unused Imports:** Run a check for unused imports at the end of every file edit. Remove them.
- **Console Logs:** Remove all `console.log` statements used for debugging before marking a task as complete.
- **Orphaned Files:** If a refactor makes an entire file obsolete (e.g., you moved logic from `utils.ts` to `date-helper.ts` and `utils.ts` is empty), delete the original file.

### 3. Refactoring Guardrails
- **Incremental Changes:** Do not rewrite an entire file to change one function. Edit *only* the specific lines needed.
- **Preserve Comments:** Do not remove comments that explain *business logic* or edge cases unless that logic itself is being removed.

### 4. Data & Testing
- **No mocking:** Use real API calls and data
- **Seed data:** Maintain [prisma/seed.ts](cci:7://file:///Users/chaitanyanarukulla/Projects/QA/prisma/seed.ts:0:0-0:0) for development data
- **Environment:** Use `.env.local` for local configuration
- **Error handling:** Always handle API errors gracefully

### 5. File Naming & Organization
- **Components:** kebab-case (e.g., [test-case-list.tsx](cci:7://file:///Users/chaitanyanarukulla/Projects/QA/src/components/test-cases/test-case-list.tsx:0:0-0:0))
- **Actions:** kebab-case (e.g., [test-runs.ts](cci:7://file:///Users/chaitanyanarukulla/Projects/QA/src/app/actions/test-runs.ts:0:0-0:0))
- **Types:** PascalCase interfaces/types
- **Constants:** UPPER_SNAKE_CASE
- **Group related files:** Keep components with their styles/tests

### 6. Code Style
- **Prefer functional components** over class components
- **Use async/await** over .then() chains
- **Descriptive variable names** - No single letters except loop counters
- **Extract magic numbers** to named constants
- **Early returns** to reduce nesting

### 7. Documentation
- **Complex functions:** Add JSDoc comments explaining purpose
- **API routes:** Document expected request/response format
- **Non-obvious logic:** Explain WHY, not just WHAT
- **Update README.md** when adding major features


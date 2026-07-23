## Test Register Tool Implementation

Starting the implementation of the Test Register (QA ring flagship) OpenSpec change.

**Status:** In Progress
**Blocked by:** pipeline-store.ts (data contract from blog-49i)
**Dependencies:** Spec Builder (blog-wn0), Vertical Slicer (blog-m7d)
**Dependencies needed for:** 9 "Article:" posts (qa content series)

**Implementation Summary:**
- QA ring flagship tool: the most sophisticated pipeline tool
- Tracks test scenarios linking to stories and acceptance criteria
- Core innovation: staleness detection when referenced content changes
- Critics: The `resolveScenarioLinks()` pure function returns text snapshots

**Key Features:**
1. Test scenarios with references to stories and criteria (via contract refs)
2. Snapshot-based tracking of source text when links are created
3. Drift detection: scenario flags as "stale — spec may need AI regeneration"
4. Automation status lifecycle: not-automated → ai-drafted → human-reviewed
5. Coverage gap lists (uncovered criteria/stories)
6. Integration with Spec Builder and Vertical Slicer (read-only)

**Files to create:**
- `src/utils/test-register-store.ts` - Store module
- `src/components/tools/test-register/` - React island components
- `src/pages/tools/test-register.astro` - Page with teaching content
- `src/utils/analytics.ts` - Analytics for tracking user actions

**D5 Reference:** Mirrors the approach used in `Opportunity Solution Tree`
- Single React island (`client:load`) on a static page
- No backend, all localStorage persistence
- Practitioner-level teaching content

**Core Challenge:**
`resolveScenarioLinks()` - the pure function that compares snapshot text vs.
current text from sibling stores to detect staleness and flag the scenario

Let me start with the store module first.
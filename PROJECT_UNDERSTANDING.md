# Project Understanding

## 1. What This App Is
- A Vite + React + TypeScript frontend for NEET prep workflows.
- Main pillars:
  - Auth and onboarding
  - Dashboard and practice entry points
  - NeuronZ spaced-revision system
  - Quiz/Test playing flows
  - AI quiz generation
  - Social/chat and leaderboard features

## 2. Architecture Snapshot
- Routing and providers are centralized in `src/App.tsx`.
- State management is mixed:
  - Redux slice for NeuronZ (`src/store/slices/neuronzSlice.ts`)
  - React Context for auth/language/revision
  - React Query present as global provider
- API calls are centralized through Axios:
  - Base client: `src/lib/api.ts`
  - Endpoint grouping: `src/lib/apiService.ts`

## 3. Key Functional Flows I Reviewed

### 3.1 Quiz Flow
- Pages:
  - `src/pages/QuizStart.tsx`
  - `src/pages/QuizSession.tsx`
  - `src/pages/QuizResults.tsx`
- Reusable player:
  - `src/components/QuizPlayer.tsx`
- Question rendering variants:
  - `src/components/QuestionRenderer.tsx`

### 3.2 Test Series Flow
- Session/play:
  - `src/pages/TestSession.tsx`
- Uses `QuizPlayer` for rendering/navigation.

### 3.3 NeuronZ Practice Flow
- Start with subject/topic:
  - `src/pages/StartPractice.tsx`
- Revision queue + micro-quizzes:
  - `src/pages/Revision.tsx`
- Redux async thunks:
  - `loadDueLines`, `generateMicroQuizzes`, `processLineSession`

## 4. What I Changed

### 4.1 Quiz Module Stabilization
- Fixed blocked progression in practice mode where next/submit logic was wrong.
- Reworked `QuizSession` to load questions from API (`getRandomQuestions`) with safe fallback.
- Made answer tracking index-based (prevent duplicate append behavior in test mode).
- Added direct-entry safety in `QuizSession` and `QuizResults` (missing route state no longer breaks flow).
- Added defaults for `QuizStart` header when opened without state.

### 4.2 Test Flow Persistence
- Wired per-question save in `TestSession` using `apiService.tests.saveAnswer` via `QuizPlayer.onAnswerChange`.
- Kept final submit behavior intact (`submitTest`).

### 4.3 QuizPlayer UX Fix
- Removed blank transition after submit.
- Added submit-in-progress guarding with button state (`Submitting...`).

### 4.4 Question Type Reliability
- Reworked `QuestionRenderer` to avoid conditional hook usage.
- Added compatibility for `numeric` and `numerical`.
- Fixed match interaction so left/right mapping is selectable (not hardcoded).

### 4.5 NeuronZ Subject/Topic -> Quiz Start Flow
- Updated `StartPractice` to navigate with `autoStart=1` after successful track.
- In `Revision`, added one-time auto-start behavior for first due line when `autoStart=1`.
- Normalized line ID resolution in `Revision` so API calls work whether `lineId` is a string or populated object.

## 5. Current Flow Status (After Changes)
- Subject/topic NeuronZ start:
  - Track succeeds -> revision opens -> first due line can auto-start -> micro-quiz generation -> submission back to queue.
- Quiz start/session/results:
  - Handles missing state safely.
  - Session progression and submission path works.
- Test session:
  - Answers now persist while playing, not only at final submit.

## 6. Known Remaining Risks / Debt
- Lint debt is still large project-wide (many `any` usages and hook dependency warnings in untouched files).
- Test coverage is minimal (currently only a placeholder unit test).
- Bundle is large in production build (warning about chunk size).
- Some text encoding artifacts exist in UI strings across older files.

## 7. Suggested Next Priority
1. Define shared API response/DTO types and remove `any` from core quiz/neuronz/test pages first.
2. Add integration tests for:
   - `StartPractice -> Revision auto-start`
   - `QuizStart -> QuizSession -> QuizResults`
   - `TestSession answer-save + submit`
3. Introduce code-splitting for heavy pages/routes to reduce main bundle size.


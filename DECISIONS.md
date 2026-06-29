# Architecture decisions

## 1. Client polymorphism — single table vs separate tables
**Decision**: Single `Client` table with nullable fields + `ClientType` enum.
**Rationale**: The two types share most fields and are always queried together in the opportunity context. A union table avoids JOINs and keeps the API simple. Nullable fields are documented and validated at the DTO layer, not the DB layer.

## 2. What makes an opportunity "problematic"
**Decision**: Two independent flags — `isLate` (past close date, not closed) and `isStagnant` (no stage change in 14 days, not closed).
**Rationale**: 14 days is a sensible default for a sales cycle. These are computed at query time and never stored — keeping the DB clean and the logic adjustable. The two flags are separate so the UI can display distinct messages.

## 3. Pipeline summary indicators
**Decision**: totalPipelineValue, winRate, averageDealSize, byStage breakdown, problematicCount.
**Rationale**: These are the four questions any sales manager asks first: how much is in play, how often do we win, what's the average deal, and what needs attention now.

## 4. lastStageChange field
**Decision**: Dedicated `lastStageChange` column updated on every stage transition.
**Rationale**: Stagnation detection needs to know when the stage last changed. Deriving this from an audit log would require an extra table. A single column is simple, accurate, and fast to query.

## 5. Monorepo structure
**Decision**: pnpm workspace with `apps/backend` and `apps/frontend`.
**Rationale**: Keeps shared TypeScript types colocatable, simplifies Docker Compose setup, and makes the project easier to clone and run in one command.

## 6. Error handling strategy
**Decision**: Global NestJS HttpExceptionFilter, consistent `{ statusCode, message, errors, timestamp, path }` shape.
**Rationale**: Predictable error envelopes let the frontend handle all errors generically without inspecting response structures.
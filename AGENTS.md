# AGENTS.md

Guidance for anyone (human or AI agent) changing this repository. Keep it
current: when an agent gets something wrong, add the rule here in the same PR
that fixes it.

## Project

Car rental app for the Mobile Software Development course (MSD2026, Group 3).
Requirements (FR#, NFR#) and the navigation model (screen IDs S1, S2, …) live
in the group's design document; reference those IDs in PRs and code comments.

## Hard constraints

- **Expo SDK 54 only.** The course requires it and the app must run in Expo Go
  for SDK 54. Never bump `expo`, `react-native`, `react` or any `expo-*`
  package to another SDK. Add native packages with `npx expo install <pkg>` so
  the SDK 54 compatible version is picked.
- No custom native code, no `expo prebuild`: everything must work in Expo Go.
- Never commit secrets. Configuration goes in `.env` (git-ignored); document
  new variables in `.env.example`. Only `EXPO_PUBLIC_*` variables reach the app.

## Architecture

```
src/app/        Screens, Expo Router file-based routes (stack navigation)
src/hooks/      React Query hooks (use-cars, use-bookings) + UI hooks
src/api/        Repository interfaces (types.ts) and implementations
  json/         CarRepository backed by the fixtures in src/data (dummy data)
  local/        BookingRepository and AuthRepository backed by AsyncStorage
src/domain/     Pure business rules (pricing, availability), no React or storage
src/offline/    Connectivity (NetInfo) + booking sync manager (NFR2/NFR3)
src/validation/ zod schemas for the booking and payment forms (NFR5)
src/models/     TypeScript domain types
src/components/ Shared UI components
```

Data flow: screen → hook → TanStack Query (cache persisted to AsyncStorage,
NFR1) → repository from `src/api/index.ts` → data source.

- Screens never import a repository implementation directly; they go through
  hooks, and hooks go through `src/api/index.ts`.
- The data source is chosen in `src/api/index.ts` only; replacing it must not
  require changes above `src/api`.
- Prices are only ever computed by `calculatePrice` in `src/domain/pricing.ts`,
  so booking and modifying a booking can't disagree.
- Booking writes go through the repository's write queue; never read-modify-
  write the bookings list anywhere else.
- Bookings are always written locally first and synced by
  `src/offline/syncManager.ts`; the UI shows sync state (pending/failed/synced).
- Store only what the data model needs: no card details on bookings, no plain
  passwords (only salted hashes).
- Who is logged in comes from `useAuth()` (`src/hooks/use-auth.tsx`). Guests
  may browse; creating a booking always needs a logged-in user.
- Bump the `buster` in `src/api/queryClient.ts` when a cached type changes shape.

## Conventions

- TypeScript strict mode; no `any` without a comment explaining why.
- Imports use the `@/` alias for `src/`.
- File names in kebab-case (`car-card.tsx`); components in PascalCase.
- Forms use `react-hook-form` with a zod schema from `src/validation`.
- Formatting by Prettier (`.prettierrc`), linting by `eslint-config-expo`.
- Tests sit next to the code in `__tests__/` folders, named `*.test.ts(x)`.

## Definition of done

A change is done when:

1. It is on a branch and merged into `main` through a pull request.
2. CI is green: `npm run lint`, `npm run typecheck`, `npx prettier --check .`,
   `npm test`.
3. New logic (validation, repositories, sync, hooks) has tests.
4. A teammate who did not write or generate the code has reviewed and approved
   it, and can explain it.
5. It runs in Expo Go (SDK 54) on at least one phone.
6. AI use is logged in the design document's Appendix A (tool, task, prompt or
   link, how it was verified, decision), and wrong AI output in the failure log.

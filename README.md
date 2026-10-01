# MSD2026-Group3

Car rental app for the Mobile Software Development course (Fall 2026). See the
design document for objectives, personas, findings, and requirements (FR#/NFR#).

## Stack

- [Expo](https://expo.dev) **SDK 57** + [React Native](https://reactnative.dev) 0.86, TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation, routes live under `src/app`)
- [TanStack Query](https://tanstack.com/query) for data fetching/caching, persisted to `AsyncStorage` so cached data survives offline and app restarts (NFR1)
- `react-hook-form` + `zod` for form validation (NFR5)
- Jest + React Native Testing Library for tests

## Getting started

```bash
npm install
npm start
```

Then press `i` (iOS simulator), `a` (Android emulator), or `w` (web) — or scan
the QR code with Expo Go. Expo Go must support SDK 57.

## Contributing

See [AGENTS.md](AGENTS.md) for conventions, architecture, and the definition
of done. All changes go into `main` through a pull request with a green CI run
and a review from a teammate who didn't write the code.

## Project structure

```
src/
  app/            Screens (Expo Router file-based routes)
  api/            Repository interfaces + implementations (see below)
  data/           Dummy catalog: cars, locations, insurance (JSON)
  domain/         Pure business rules: pricing, availability
  models/         TypeScript types (Car, Location, Insurance, Booking, User)
  validation/     Zod schemas for form validation
  offline/        Connectivity + booking sync (NFR2/NFR3)
  hooks/          React Query hooks and shared UI hooks
  components/     Shared UI components
```

## Data and caching

The catalog (cars, locations, insurance) is read through the `CarRepository`
interface (`src/api/types.ts`). Today `src/api/json/carRepository.ts`
implements it against the fixtures in `src/data`. A real backend implements
the same interface and is swapped in in `src/api/index.ts`; no screen or hook
changes.

Bookings are always written locally first (`src/api/local/bookingRepository.ts`,
backed by `AsyncStorage`), because they're user-generated and must work
offline. Writes are queued so they never overwrite each other, and a booking
that overlaps another active booking of the same car is refused.
`src/offline/syncManager.ts` pushes pending bookings to the backend (a stub
for now) one at a time.

Caching rules:

- **Catalog:** cached by TanStack Query and persisted to `AsyncStorage` for
  24 hours, so browsed cars stay available offline (NFR1). It's refetched
  when older than 5 minutes, when the app returns to the foreground and when
  the connection comes back. Bump `buster` in `src/api/queryClient.ts`
  whenever the shape of cached data changes.
- **Bookings:** the local repository is the source of truth, so booking
  queries aren't persisted a second time. Changes sync right away when
  online, on reconnect, on app start, and when the user taps Retry.
- In dev builds, My bookings has a "Simulate sync failure" switch to demo the
  failed-sync state.

## Scripts

- `npm start` / `npm run ios` / `npm run android` / `npm run web`
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm test` — Jest
- `npm run format` — Prettier

## Status

Car list with location and type filters, price sort and per-day price ranges,
car details, booking form with native date pickers, live price breakdown and
availability check, mock checkout, and
self-service booking management (view/modify/cancel) work against the JSON
fixtures with local persistence and a sync-status indicator. Not yet
implemented: a separate search screen with dates (S2), more filters (FR7),
return reminders (FR10), and the real backend.

Accounts (FR9): on launch the app offers "Create account", "Log in" or
"Continue as guest". Guests can browse; paying for a booking or opening My
bookings asks them to log in or sign up first. Accounts are stored on the
device only (`src/api/local/authRepository.ts`, salted SHA-256 password
hashes) until there is a backend.

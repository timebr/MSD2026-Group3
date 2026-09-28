# MSD2026-Group3

Car rental app for the Mobile Software Development course (Fall 2026). See the
design document for objectives, personas, findings, and requirements (FR#/NFR#).

## Stack

- [Expo](https://expo.dev) **SDK 54** (required by the course, don't upgrade) + [React Native](https://reactnative.dev) 0.81, TypeScript
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
the QR code with Expo Go on a physical device. Expo Go must support SDK 54.

## Contributing

See [AGENTS.md](AGENTS.md) for conventions, architecture, and the definition
of done. All changes go into `main` through a pull request with a green CI run
and a review from a teammate who didn't write the code.

## Project structure

```
src/
  app/            Screens (Expo Router file-based routes)
  api/            Repository interfaces + implementations (see below)
  data/           Dummy car catalog (src/data/cars.json)
  models/         TypeScript types for Car, Booking, User
  validation/     Zod schemas for form validation
  offline/        Connectivity + booking sync (NFR2/NFR3)
  hooks/          React Query hooks and shared UI hooks
  components/     Shared UI components
```

## Data source: JSON now, Supabase/Mongo later

The car catalog is read through the `CarRepository` interface
(`src/api/types.ts`). Today `src/api/json/carRepository.ts` implements it
against the dummy fixture in `src/data/cars.json`. When the team builds the
real backend, implement the same interface in
`src/api/supabase/carRepository.ts` (already stubbed with the steps) and set:

```
EXPO_PUBLIC_DATA_SOURCE=supabase
```

in a local `.env` file (copy `.env.example`). No screen or hook needs to
change — they all go through `src/api/index.ts`.

Bookings are always written locally first (`src/api/local/bookingRepository.ts`,
backed by `AsyncStorage`) regardless of data source, since they're
user-generated and need to work offline. `src/offline/syncManager.ts` is
where pending bookings get pushed to the real backend once one exists.

## Scripts

- `npm start` / `npm run ios` / `npm run android` / `npm run web`
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript, no emit
- `npm test` — Jest
- `npm run format` — Prettier

## Status

Initial scaffold: navigation shell, car list/detail, booking form, mock
checkout, and self-service booking management (view/modify/cancel) are wired
up against the JSON fixture with local persistence and a sync-status
indicator. Not yet implemented: registration (FR9), filtering beyond type
(FR7), return reminders (FR10), and the real backend.

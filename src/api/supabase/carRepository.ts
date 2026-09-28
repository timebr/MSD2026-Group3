import type { CarRepository } from '@/api/types';

/**
 * Placeholder for the future Supabase/Mongo-backed catalog.
 *
 * To implement:
 * 1. `npm install @supabase/supabase-js` (or the Mongo client of choice).
 * 2. Add the client credentials as EXPO_PUBLIC_* env vars (never commit keys).
 * 3. Implement `listCars`/`getCar` against the real table, keeping the
 *    `CarFilters`/`CarSort` semantics from `src/api/types.ts` identical so
 *    nothing above this file has to change.
 * 4. Set `EXPO_PUBLIC_DATA_SOURCE=supabase` and remove the `NOT_IMPLEMENTED`
 *    guard in `src/api/index.ts`.
 */
export class SupabaseCarRepository implements CarRepository {
  async listCars(): Promise<never> {
    throw new Error('SupabaseCarRepository is not implemented yet — see the file header for the plan.');
  }

  async getCar(): Promise<never> {
    throw new Error('SupabaseCarRepository is not implemented yet — see the file header for the plan.');
  }
}

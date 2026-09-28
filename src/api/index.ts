import { LocalBookingRepository } from '@/api/local/bookingRepository';
import { JsonCarRepository } from '@/api/json/carRepository';
import { SupabaseCarRepository } from '@/api/supabase/carRepository';
import type { BookingRepository, CarRepository } from '@/api/types';

/**
 * Single switch for where the car catalog comes from. Set
 * `EXPO_PUBLIC_DATA_SOURCE=supabase` in `.env` once the real backend exists
 * (see `src/api/supabase/carRepository.ts`); everything else in the app
 * reads through `carRepository` below and doesn't need to know which one
 * is active.
 */
type DataSource = 'json' | 'supabase';

const dataSource = (process.env.EXPO_PUBLIC_DATA_SOURCE as DataSource | undefined) ?? 'json';

function createCarRepository(): CarRepository {
  switch (dataSource) {
    case 'supabase':
      return new SupabaseCarRepository();
    case 'json':
    default:
      return new JsonCarRepository();
  }
}

export const carRepository: CarRepository = createCarRepository();

// Bookings are always local-first regardless of data source — see
// src/api/local/bookingRepository.ts and src/offline/syncManager.ts.
export const bookingRepository: BookingRepository & { setSyncState: LocalBookingRepository['setSyncState'] } =
  new LocalBookingRepository();

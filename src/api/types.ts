import type { Booking, CreateBookingInput, UpdateBookingInput } from '@/models/booking';
import type { Car, CarFilters, CarSort } from '@/models/car';

/**
 * Data-source-agnostic contract for reading the car catalog.
 *
 * Today `JsonCarRepository` reads `src/data/cars.json`. When the team stands
 * up the Supabase/Mongo backend, implement this interface against it (see
 * `src/api/supabase/carRepository.ts`) and flip `EXPO_PUBLIC_DATA_SOURCE` —
 * no screen or hook needs to change.
 */
export interface CarRepository {
  listCars(filters?: CarFilters, sort?: CarSort): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
}

/**
 * Data-source-agnostic contract for reading/writing bookings.
 *
 * Bookings are user-generated, so — unlike the car catalog — they always go
 * through local persistence first (NFR1/NFR2) regardless of which remote
 * backend is configured; see `src/api/local/bookingRepository.ts` and
 * `src/offline/syncManager.ts` for how pending writes reach the backend.
 */
export interface BookingRepository {
  listBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(input: CreateBookingInput): Promise<Booking>;
  updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking>;
}

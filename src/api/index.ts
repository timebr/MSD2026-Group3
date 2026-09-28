import { JsonCarRepository } from '@/api/json/carRepository';
import { LocalBookingRepository } from '@/api/local/bookingRepository';
import type { CarRepository } from '@/api/types';

/**
 * The one place that decides where data comes from. Screens and hooks only
 * see the `CarRepository`/`BookingRepository` interfaces (Repository pattern),
 * so swapping the JSON fixture for a real backend is a change to this file.
 */
export const carRepository: CarRepository = new JsonCarRepository();

// Bookings are always local-first, see src/offline/syncManager.ts.
export const bookingRepository = new LocalBookingRepository();

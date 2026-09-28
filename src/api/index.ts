import { JsonCarRepository } from '@/api/json/carRepository';
import { LocalAuthRepository } from '@/api/local/authRepository';
import { LocalBookingRepository } from '@/api/local/bookingRepository';
import type { AuthRepository, CarRepository } from '@/api/types';

/**
 * The one place that decides where data comes from. Screens and hooks only
 * see the repository interfaces (Repository pattern), so swapping the JSON
 * fixture or the on-device accounts for a real backend is a change to this file.
 */
export const carRepository: CarRepository = new JsonCarRepository();

export const authRepository: AuthRepository = new LocalAuthRepository();

// Bookings are always local-first, see src/offline/syncManager.ts.
export const bookingRepository = new LocalBookingRepository();

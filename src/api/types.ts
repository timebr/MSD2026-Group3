import type { Booking, CreateBookingInput, UpdateBookingInput } from '@/models/booking';
import type { Car, CarFilters, CarSort } from '@/models/car';
import type { Insurance } from '@/models/insurance';
import type { Location } from '@/models/location';
import type { User } from '@/models/user';

/**
 * Data-source-agnostic contract for reading the catalog (cars and the
 * locations and insurance options they're offered with).
 *
 * Today `JsonCarRepository` reads the fixtures in `src/data`. When the team
 * adds a backend, implement this interface against it and export that
 * implementation from `src/api/index.ts`; no screen or hook needs to change.
 */
export interface CarRepository {
  listCars(filters?: CarFilters, sort?: CarSort): Promise<Car[]>;
  getCar(id: string): Promise<Car | undefined>;
  listLocations(): Promise<Location[]>;
  listInsurance(): Promise<Insurance[]>;
}

/** Thrown when a booking would overlap another active booking of the same car. */
export class CarUnavailableError extends Error {
  constructor() {
    super('This car is already booked for some of those dates.');
    this.name = 'CarUnavailableError';
  }
}

/**
 * Data-source-agnostic contract for reading/writing bookings.
 *
 * Bookings are user-generated, so — unlike the car catalog — they always go
 * through local persistence first (NFR1/NFR2); see
 * `src/api/local/bookingRepository.ts` and `src/offline/syncManager.ts` for
 * how pending writes reach the backend.
 */
export interface BookingRepository {
  listBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  isAvailable(carId: string, startDate: string, endDate: string, ignoreBookingId?: string): Promise<boolean>;
  /** @throws CarUnavailableError */
  createBooking(input: CreateBookingInput): Promise<Booking>;
  /** @throws CarUnavailableError */
  updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking>;
}

export class EmailTakenError extends Error {
  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailTakenError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Wrong email or password.');
    this.name = 'InvalidCredentialsError';
  }
}

/**
 * Accounts (FR9). Today they live on the device only; a backend would
 * implement the same interface.
 */
export interface AuthRepository {
  /** The logged-in user, or null when nobody is logged in. */
  currentUser(): Promise<User | null>;
  /** @throws EmailTakenError */
  signUp(input: { name: string; email: string; password: string }): Promise<User>;
  /** @throws InvalidCredentialsError */
  logIn(input: { email: string; password: string }): Promise<User>;
  logOut(): Promise<void>;
}

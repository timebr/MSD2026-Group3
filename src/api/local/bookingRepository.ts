import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BookingRepository } from '@/api/types';
import type { Booking, CreateBookingInput, UpdateBookingInput } from '@/models/booking';
import { generateId } from '@/utils/id';

const STORAGE_KEY = 'bookings:v1';

async function readAll(): Promise<Booking[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Booking[]) : [];
}

async function writeAll(bookings: Booking[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

/**
 * Bookings are always written here first (optimistic, offline-first — NFR1),
 * tagged `syncState: 'pending'`. `src/offline/syncManager.ts` is responsible
 * for pushing pending rows to the backend once one exists and flipping them
 * to `synced`/`failed` (NFR2/NFR3). This repository never talks to the
 * network itself.
 */
export class LocalBookingRepository implements BookingRepository {
  async listBookings(): Promise<Booking[]> {
    const bookings = await readAll();
    return bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const bookings = await readAll();
    return bookings.find((booking) => booking.id === id);
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    const now = new Date().toISOString();
    const booking: Booking = {
      ...input,
      id: generateId('booking'),
      status: 'confirmed',
      syncState: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const bookings = await readAll();
    bookings.push(booking);
    await writeAll(bookings);
    return booking;
  }

  async updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking> {
    const bookings = await readAll();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new Error(`Booking ${id} not found`);
    }

    const updated: Booking = {
      ...bookings[index],
      ...patch,
      status: 'modified',
      syncState: 'pending',
      updatedAt: new Date().toISOString(),
    };
    bookings[index] = updated;
    await writeAll(bookings);
    return updated;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const bookings = await readAll();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new Error(`Booking ${id} not found`);
    }

    const updated: Booking = {
      ...bookings[index],
      status: 'cancelled',
      syncState: 'pending',
      updatedAt: new Date().toISOString(),
    };
    bookings[index] = updated;
    await writeAll(bookings);
    return updated;
  }

  /** Used by the sync manager to flip a row's sync state after a push attempt. */
  async setSyncState(id: string, syncState: Booking['syncState']): Promise<void> {
    const bookings = await readAll();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) return;
    bookings[index] = { ...bookings[index], syncState };
    await writeAll(bookings);
  }
}

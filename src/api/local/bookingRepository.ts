import AsyncStorage from '@react-native-async-storage/async-storage';

import { CarUnavailableError, type BookingRepository } from '@/api/types';
import { isCarAvailable } from '@/domain/availability';
import type { Booking, CreateBookingInput, SyncState, UpdateBookingInput } from '@/models/booking';
import { generateId } from '@/utils/id';

const STORAGE_KEY = 'bookings:v3';

async function readAll(): Promise<Booking[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Booking[]) : [];
}

async function writeAll(bookings: Booking[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

// Every write reads the whole list, changes one row and writes the list back.
// Two of those running at once (e.g. a sync pass and a user edit) would
// overwrite each other, so writes are queued and run one at a time.
let writeQueue: Promise<unknown> = Promise.resolve();

function exclusive<T>(task: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(task);
  writeQueue = result.catch(() => undefined);
  return result;
}

function modify(id: string, change: (booking: Booking, all: Booking[]) => Booking): Promise<Booking> {
  return exclusive(async () => {
    const bookings = await readAll();
    const index = bookings.findIndex((booking) => booking.id === id);
    if (index === -1) {
      throw new Error(`Booking ${id} not found`);
    }
    bookings[index] = change(bookings[index], bookings);
    await writeAll(bookings);
    return bookings[index];
  });
}

/**
 * Bookings are always written here first (offline-first, NFR1), tagged
 * `syncState: 'pending'`. `src/offline/syncManager.ts` pushes pending rows to
 * the backend and flips them to `synced`/`failed` (NFR2/NFR3). This
 * repository never talks to the network itself.
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

  async isAvailable(carId: string, startDate: string, endDate: string, ignoreBookingId?: string): Promise<boolean> {
    return isCarAvailable(await readAll(), carId, startDate, endDate, ignoreBookingId);
  }

  createBooking(input: CreateBookingInput): Promise<Booking> {
    return exclusive(async () => {
      const bookings = await readAll();
      if (!isCarAvailable(bookings, input.carId, input.startDate, input.endDate)) {
        throw new CarUnavailableError();
      }
      const now = new Date().toISOString();
      const booking: Booking = {
        ...input,
        id: generateId('booking'),
        status: 'confirmed',
        syncState: 'pending',
        createdAt: now,
        updatedAt: now,
      };
      bookings.push(booking);
      await writeAll(bookings);
      return booking;
    });
  }

  updateBooking(id: string, patch: UpdateBookingInput): Promise<Booking> {
    return modify(id, (booking, all) => {
      const updated = { ...booking, ...patch };
      if (!isCarAvailable(all, updated.carId, updated.startDate, updated.endDate, id)) {
        throw new CarUnavailableError();
      }
      return { ...updated, syncState: 'pending', updatedAt: new Date().toISOString() };
    });
  }

  cancelBooking(id: string): Promise<Booking> {
    return modify(id, (booking) => ({
      ...booking,
      status: 'cancelled',
      syncState: 'pending',
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Used by the sync manager after a push attempt. `pushedVersion` is the
   * `updatedAt` of the snapshot that was pushed: if the user changed the
   * booking meanwhile, that newer change hasn't reached the backend, so the
   * row stays `pending` for the next pass instead of being marked `synced`.
   */
  async setSyncState(id: string, syncState: SyncState, pushedVersion: string): Promise<void> {
    await modify(id, (booking) => (booking.updatedAt === pushedVersion ? { ...booking, syncState } : booking)).catch(
      () => undefined, // deleted meanwhile; nothing to update
    );
  }
}

import { onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';

import { bookingRepository } from '@/api';
import { queryClient } from '@/api/queryClient';
import { bookingKeys } from '@/api/queryKeys';
import type { Booking } from '@/models/booking';
import { useIsOnline } from '@/offline/connectivity';

// There is no backend yet, so pushes succeed unless failure is simulated.
// The toggle lets the team demo the pending/failed states (S6a/S6b).
let simulateFailure = false;

export function setSimulateSyncFailure(value: boolean): void {
  simulateFailure = value;
}

export function isSimulatingSyncFailure(): boolean {
  return simulateFailure;
}

/** Stand-in for the backend call; replace the body once there is an API. */
async function pushBookingToRemote(_booking: Booking): Promise<void> {
  if (simulateFailure) {
    throw new Error('Simulated sync failure');
  }
}

async function syncPass(): Promise<void> {
  const bookings = await bookingRepository.listBookings();
  for (const booking of bookings.filter((b) => b.syncState !== 'synced')) {
    let result: Booking['syncState'];
    try {
      await pushBookingToRemote(booking);
      result = 'synced';
    } catch {
      result = 'failed';
    }
    await bookingRepository.setSyncState(booking.id, result, booking.updatedAt);
  }
}

let running: Promise<void> | null = null;
let runAgain = false;

/**
 * Pushes every booking that hasn't reached the backend, one at a time, so
 * rows are never written concurrently. A failed push marks the booking
 * `failed`; it's retried on the next pass, which runs on launch, on
 * reconnect, after every booking change and when the user taps Retry (NFR2).
 */
export function syncPendingBookings(): Promise<void> {
  if (running) {
    // Something changed during this pass; go round once more when it ends.
    runAgain = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        runAgain = false;
        await syncPass();
      } while (runAgain);
    } finally {
      running = null;
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    }
  })();
  return running;
}

/** Runs a sync pass on mount and whenever connectivity is regained (NFR2). */
export function useAutoSync(): void {
  const isOnline = useIsOnline();

  useEffect(() => {
    if (isOnline) {
      syncPendingBookings();
    }
  }, [isOnline]);
}

/** Starts a sync pass if online; used after booking changes and by the Retry action. */
export function requestSync(): Promise<void> {
  return onlineManager.isOnline() ? syncPendingBookings() : Promise.resolve();
}

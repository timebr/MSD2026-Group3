import { useEffect, useState } from 'react';

import { bookingRepository } from '@/api';
import { queryClient } from '@/api/queryClient';
import { bookingKeys } from '@/api/queryKeys';
import { useIsOnline } from '@/offline/connectivity';
import type { Booking } from '@/models/booking';

// Sync happens outside React Query's own mutation lifecycle (it's driven by
// connectivity, not a user action), so it invalidates these keys directly
// to keep any mounted list/detail screens in sync.
function invalidateBookingQueries(id: string) {
  queryClient.invalidateQueries({ queryKey: bookingKeys.list });
  queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
}

/**
 * Stand-in for the real backend push. Until the Supabase/Mongo API exists
 * this always "succeeds" (there is nothing to fail against), but the retry
 * plumbing around it is real: replace the body with the actual API call and
 * the backoff/status behaviour below starts working against real failures.
 */
async function pushBookingToRemote(_booking: Booking): Promise<void> {
  return Promise.resolve();
}

const BACKOFF_STEPS_MS = [1000, 5000, 30000];

async function syncOne(booking: Booking): Promise<void> {
  for (const delayMs of [0, ...BACKOFF_STEPS_MS]) {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
    try {
      await pushBookingToRemote(booking);
      await bookingRepository.setSyncState(booking.id, 'synced');
      invalidateBookingQueries(booking.id);
      return;
    } catch {
      // keep retrying through the backoff schedule
    }
  }
  await bookingRepository.setSyncState(booking.id, 'failed');
  invalidateBookingQueries(booking.id);
}

export async function syncPendingBookings(): Promise<void> {
  const bookings = await bookingRepository.listBookings();
  const pending = bookings.filter((booking) => booking.syncState !== 'synced');
  await Promise.all(pending.map(syncOne));
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

/** Pending/failed counts for a sync-status indicator (NFR3). */
export function useSyncStatus(): { pending: number; failed: number } {
  const [status, setStatus] = useState({ pending: 0, failed: 0 });
  const isOnline = useIsOnline();

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const bookings = await bookingRepository.listBookings();
      if (cancelled) return;
      setStatus({
        pending: bookings.filter((b) => b.syncState === 'pending').length,
        failed: bookings.filter((b) => b.syncState === 'failed').length,
      });
    }

    refresh();
    const interval = setInterval(refresh, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isOnline]);

  return status;
}

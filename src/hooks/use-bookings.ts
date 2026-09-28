import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookingRepository } from '@/api';
import { bookingKeys } from '@/api/queryKeys';
import type { CreateBookingInput, UpdateBookingInput } from '@/models/booking';
import { requestSync } from '@/offline/syncManager';

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.list,
    queryFn: () => bookingRepository.listBookings(),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: async () => (await bookingRepository.getBooking(id as string)) ?? null,
    enabled: Boolean(id),
  });
}

/** Whether the car is free for those dates; checked before checkout so the user isn't told at the end. */
export function checkAvailability(carId: string, startDate: string, endDate: string, ignoreBookingId?: string) {
  return bookingRepository.isAvailable(carId, startDate, endDate, ignoreBookingId);
}

/** Pending/failed counts for the sync-status indicator (NFR3). */
export function useSyncStatus(): { pending: number; failed: number } {
  const { data: bookings = [] } = useBookings();
  return {
    pending: bookings.filter((b) => b.syncState === 'pending').length,
    failed: bookings.filter((b) => b.syncState === 'failed').length,
  };
}

// Every booking change is written locally, shown straight away, then pushed
// to the backend in the background.
function useBookingMutation<TInput, TResult>(mutationFn: (input: TInput) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      requestSync();
    },
  });
}

export function useCreateBooking() {
  return useBookingMutation((input: CreateBookingInput) => bookingRepository.createBooking(input));
}

export function useUpdateBooking() {
  return useBookingMutation(({ id, patch }: { id: string; patch: UpdateBookingInput }) =>
    bookingRepository.updateBooking(id, patch),
  );
}

export function useCancelBooking() {
  return useBookingMutation((id: string) => bookingRepository.cancelBooking(id));
}

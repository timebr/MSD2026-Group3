import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { bookingRepository } from '@/api';
import { bookingKeys } from '@/api/queryKeys';
import type { CreateBookingInput, UpdateBookingInput } from '@/models/booking';

export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.list,
    queryFn: () => bookingRepository.listBookings(),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ''),
    queryFn: () => bookingRepository.getBooking(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) => bookingRepository.createBooking(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.list }),
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateBookingInput }) =>
      bookingRepository.updateBooking(id, patch),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingRepository.cancelBooking(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    },
  });
}

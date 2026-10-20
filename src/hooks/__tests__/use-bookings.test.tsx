import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { authRepository, bookingRepository } from '@/api';
import { bookingKeys } from '@/api/queryKeys';
import {
  useMyBookings,
  useBooking,
  useCancelBooking,
  useCreateBooking,
  useSyncStatus,
  checkAvailability,
} from '@/hooks/use-bookings';
import { AuthProvider } from '@/hooks/use-auth';
import type { Booking } from '@/models/booking';
import { requestSync } from '@/offline/syncManager';
import type { User } from '@/models/user';

jest.mock('@/api', () => ({
  bookingRepository: {
    listBookings: jest.fn(),
    getBooking: jest.fn(),
    isAvailable: jest.fn(),
    createBooking: jest.fn(),
    updateBooking: jest.fn(),
    cancelBooking: jest.fn(),
  },
  authRepository: {
    currentUser: jest.fn(),
    signUp: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
  },
}));

jest.mock('@/offline/syncManager', () => ({ requestSync: jest.fn() }));

const mockBookingRepository = jest.mocked(bookingRepository);
const mockAuthRepository = jest.mocked(authRepository);
const mockRequestSync = jest.mocked(requestSync);

const elena: User = { id: 'user-1', name: 'Elena', email: 'elena@example.com' };

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'booking-1',
    userId: 'user-1',
    carId: 'car-1',
    pickupLocationId: 'loc-cph-airport',
    dropoffLocationId: 'loc-cph-airport',
    startDate: '2030-10-05',
    endDate: '2030-10-08',
    price: { days: 3, basePrice: 87, insuranceCost: 0, fees: 0, totalPrice: 87 },
    payment: { method: 'card', amount: 87, status: 'paid' },
    status: 'confirmed',
    syncState: 'pending',
    createdAt: '2029-01-01T10:00:00.000Z',
    updatedAt: '2029-01-01T10:00:00.000Z',
    ...overrides,
  };
}

/** Wraps hooks in the real AuthProvider so useMyBookings sees a logged-in user. */
function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

function freshClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('use-bookings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthRepository.currentUser.mockResolvedValue(elena);
    mockBookingRepository.listBookings.mockResolvedValue([]);
  });

  it('shows no bookings for a guest', async () => {
    mockAuthRepository.currentUser.mockResolvedValue(null);
    const { result } = await renderHook(() => useMyBookings(), { wrapper: makeWrapper(freshClient()) });
    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  it('shows only the logged-in user bookings', async () => {
    mockBookingRepository.listBookings.mockResolvedValue([
      makeBooking({ id: 'mine', userId: 'user-1' }),
      makeBooking({ id: 'theirs', userId: 'user-2' }),
    ]);
    const { result } = await renderHook(() => useMyBookings(), { wrapper: makeWrapper(freshClient()) });
    await waitFor(() => expect(result.current.data?.map((b) => b.id)).toEqual(['mine']));
  });

  it('does not fetch a booking without an id', async () => {
    const { result } = await renderHook(() => useBooking(undefined), { wrapper: makeWrapper(freshClient()) });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockBookingRepository.getBooking).not.toHaveBeenCalled();
  });

  it('counts pending and failed bookings for the sync indicator', async () => {
    mockBookingRepository.listBookings.mockResolvedValue([
      makeBooking({ id: 'a', syncState: 'pending' }),
      makeBooking({ id: 'b', syncState: 'failed' }),
      makeBooking({ id: 'c', syncState: 'synced' }),
      makeBooking({ id: 'd', syncState: 'pending' }),
    ]);
    const { result } = await renderHook(() => useSyncStatus(), { wrapper: makeWrapper(freshClient()) });
    await waitFor(() => expect(result.current).toEqual({ pending: 2, failed: 1 }));
  });

  it('delegates availability checks to the repository', async () => {
    mockBookingRepository.isAvailable.mockResolvedValue(true);
    await expect(checkAvailability('car-1', '2030-10-05', '2030-10-08', 'booking-1')).resolves.toBe(true);
    expect(mockBookingRepository.isAvailable).toHaveBeenCalledWith('car-1', '2030-10-05', '2030-10-08', 'booking-1');
  });

  it('writes a booking, invalidates the list and requests a sync', async () => {
    const created = makeBooking();
    mockBookingRepository.createBooking.mockResolvedValue(created);
    const client = freshClient();
    const invalidate = jest.spyOn(client, 'invalidateQueries');

    const { result } = await renderHook(() => useCreateBooking(), { wrapper: makeWrapper(client) });
    await result.current.mutateAsync({
      userId: 'user-1',
      carId: 'car-1',
      pickupLocationId: 'loc-cph-airport',
      dropoffLocationId: 'loc-cph-airport',
      startDate: '2030-10-05',
      endDate: '2030-10-08',
      price: created.price,
      payment: created.payment,
    });

    expect(mockBookingRepository.createBooking).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: bookingKeys.all }));
    expect(mockRequestSync).toHaveBeenCalledTimes(1);
  });

  it('cancels through the repository and requests a sync', async () => {
    mockBookingRepository.cancelBooking.mockResolvedValue(makeBooking({ status: 'cancelled' }));
    const { result } = await renderHook(() => useCancelBooking(), { wrapper: makeWrapper(freshClient()) });
    await result.current.mutateAsync('booking-1');
    expect(mockBookingRepository.cancelBooking).toHaveBeenCalledWith('booking-1');
    expect(mockRequestSync).toHaveBeenCalledTimes(1);
  });
});

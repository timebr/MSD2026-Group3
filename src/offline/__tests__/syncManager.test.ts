import AsyncStorage from '@react-native-async-storage/async-storage';

import { bookingRepository } from '@/api';
import type { CreateBookingInput } from '@/models/booking';
import { setSimulateSyncFailure, syncPendingBookings } from '@/offline/syncManager';

const input: CreateBookingInput = {
  userId: 'user-1',
  carId: 'car-1',
  pickupLocationId: 'loc-a',
  dropoffLocationId: 'loc-a',
  startDate: '2026-10-05',
  endDate: '2026-10-08',
  price: { days: 3, basePrice: 150, insuranceCost: 0, fees: 0, totalPrice: 150 },
  payment: { method: 'card', amount: 150, status: 'paid' },
};

async function syncStates() {
  return (await bookingRepository.listBookings()).map((booking) => booking.syncState);
}

describe('syncPendingBookings', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setSimulateSyncFailure(false);
  });

  it('marks every pending booking as synced', async () => {
    await bookingRepository.createBooking(input);
    await bookingRepository.createBooking({ ...input, carId: 'car-2' });
    await bookingRepository.createBooking({ ...input, carId: 'car-3' });

    await syncPendingBookings();

    expect(await syncStates()).toEqual(['synced', 'synced', 'synced']);
  });

  it('marks bookings as failed when the push fails, and a retry fixes them', async () => {
    await bookingRepository.createBooking(input);

    setSimulateSyncFailure(true);
    await syncPendingBookings();
    expect(await syncStates()).toEqual(['failed']);

    setSimulateSyncFailure(false);
    await syncPendingBookings();
    expect(await syncStates()).toEqual(['synced']);
  });
});

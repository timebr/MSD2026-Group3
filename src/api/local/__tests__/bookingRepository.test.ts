import AsyncStorage from '@react-native-async-storage/async-storage';

import { LocalBookingRepository } from '@/api/local/bookingRepository';
import { CarUnavailableError } from '@/api/types';
import type { CreateBookingInput } from '@/models/booking';

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

describe('LocalBookingRepository', () => {
  const repository = new LocalBookingRepository();

  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('stores a new booking as confirmed and pending sync', async () => {
    const created = await repository.createBooking(input);
    expect(created).toMatchObject({ status: 'confirmed', syncState: 'pending' });
    expect(await repository.getBooking(created.id)).toEqual(created);
  });

  it('refuses a booking that overlaps an active one', async () => {
    await repository.createBooking(input);
    await expect(repository.createBooking({ ...input, startDate: '2026-10-07' })).rejects.toBeInstanceOf(
      CarUnavailableError,
    );
  });

  it('allows the dates again once the booking is cancelled', async () => {
    const first = await repository.createBooking(input);
    await repository.cancelBooking(first.id);
    await expect(repository.createBooking(input)).resolves.toMatchObject({ status: 'confirmed' });
  });

  it('refuses to move a booking onto another booking of the same car', async () => {
    await repository.createBooking(input);
    const second = await repository.createBooking({ ...input, startDate: '2026-10-10', endDate: '2026-10-12' });
    await expect(repository.updateBooking(second.id, { startDate: '2026-10-06' })).rejects.toBeInstanceOf(
      CarUnavailableError,
    );
  });

  it('does not lose writes when sync states are set concurrently', async () => {
    const a = await repository.createBooking(input);
    const b = await repository.createBooking({ ...input, carId: 'car-2' });
    const c = await repository.createBooking({ ...input, carId: 'car-3' });

    await Promise.all([a, b, c].map((booking) => repository.setSyncState(booking.id, 'synced', booking.updatedAt)));

    const bookings = await repository.listBookings();
    expect(bookings.map((booking) => booking.syncState)).toEqual(['synced', 'synced', 'synced']);
  });

  it('keeps a booking pending if it changed after the pushed snapshot', async () => {
    const pushed = await repository.createBooking(input);
    await new Promise((resolve) => setTimeout(resolve, 5)); // make updatedAt differ
    await repository.updateBooking(pushed.id, { endDate: '2026-10-09' });

    await repository.setSyncState(pushed.id, 'synced', pushed.updatedAt);

    expect((await repository.getBooking(pushed.id))?.syncState).toBe('pending');
  });
});

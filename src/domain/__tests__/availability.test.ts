import { datesOverlap, isCarAvailable } from '@/domain/availability';
import type { Booking } from '@/models/booking';

function booking(overrides: Partial<Booking>): Booking {
  return {
    id: 'b1',
    carId: 'car-1',
    pickupLocationId: 'loc-a',
    dropoffLocationId: 'loc-a',
    startDate: '2026-10-05',
    endDate: '2026-10-08',
    price: { days: 3, basePrice: 0, insuranceCost: 0, fees: 0, totalPrice: 0 },
    payment: { method: 'card', amount: 0, status: 'paid' },
    status: 'confirmed',
    syncState: 'synced',
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('datesOverlap', () => {
  it('detects overlapping ranges', () => {
    expect(datesOverlap('2026-10-01', '2026-10-06', '2026-10-05', '2026-10-08')).toBe(true);
  });

  it('lets a pick-up happen on the day of a return', () => {
    expect(datesOverlap('2026-10-08', '2026-10-10', '2026-10-05', '2026-10-08')).toBe(false);
  });
});

describe('isCarAvailable', () => {
  it('is false when an active booking overlaps', () => {
    expect(isCarAvailable([booking({})], 'car-1', '2026-10-06', '2026-10-07')).toBe(false);
  });

  it('ignores cancelled bookings, other cars and the booking being edited', () => {
    expect(isCarAvailable([booking({ status: 'cancelled' })], 'car-1', '2026-10-06', '2026-10-07')).toBe(true);
    expect(isCarAvailable([booking({ carId: 'car-2' })], 'car-1', '2026-10-06', '2026-10-07')).toBe(true);
    expect(isCarAvailable([booking({})], 'car-1', '2026-10-06', '2026-10-09', 'b1')).toBe(true);
  });
});

import { bookingFormSchema } from '@/validation/booking';

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

describe('bookingFormSchema', () => {
  it('accepts a valid booking', () => {
    const result = bookingFormSchema.safeParse({
      pickupLocationId: 'loc-cph-airport',
      dropoffLocationId: 'loc-cph-airport',
      startDate: tomorrow,
      endDate: dayAfter,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = bookingFormSchema.safeParse({
      pickupLocationId: 'loc-cph-airport',
      dropoffLocationId: 'loc-cph-airport',
      startDate: dayAfter,
      endDate: tomorrow,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a pick-up date in the past', () => {
    const result = bookingFormSchema.safeParse({
      pickupLocationId: 'loc-cph-airport',
      dropoffLocationId: 'loc-cph-airport',
      startDate: yesterday,
      endDate: tomorrow,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing pick-up location', () => {
    const result = bookingFormSchema.safeParse({
      pickupLocationId: '',
      dropoffLocationId: 'loc-cph-airport',
      startDate: tomorrow,
      endDate: dayAfter,
    });
    expect(result.success).toBe(false);
  });
});

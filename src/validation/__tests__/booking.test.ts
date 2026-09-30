import { toDateString } from '@/utils/date';
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

  it('accepts a pick-up today but not yesterday', () => {
    const today = toDateString(new Date());
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const base = { pickupLocationId: 'loc-cph-airport', dropoffLocationId: 'loc-cph-airport', endDate: dayAfter };
    expect(bookingFormSchema.safeParse({ ...base, startDate: today }).success).toBe(true);
    expect(bookingFormSchema.safeParse({ ...base, startDate: toDateString(yesterdayDate) }).success).toBe(false);
  });
});

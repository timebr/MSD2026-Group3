import { calculatePrice, ONE_WAY_FEE, rentalDays } from '@/domain/pricing';

const car = { pricePerDay: 50 };

describe('calculatePrice', () => {
  it('itemises base price and insurance per day', () => {
    const price = calculatePrice({
      car,
      insurance: { pricePerDay: 15 },
      startDate: '2026-10-01',
      endDate: '2026-10-04',
      pickupLocationId: 'a',
      dropoffLocationId: 'a',
    });
    expect(price).toEqual({ days: 3, basePrice: 150, insuranceCost: 45, fees: 0, totalPrice: 195 });
  });

  it('adds the one-way fee when returning somewhere else', () => {
    const price = calculatePrice({
      car,
      startDate: '2026-10-01',
      endDate: '2026-10-02',
      pickupLocationId: 'a',
      dropoffLocationId: 'b',
    });
    expect(price.fees).toBe(ONE_WAY_FEE);
    expect(price.totalPrice).toBe(50 + ONE_WAY_FEE);
  });

  it('changes when the dates change', () => {
    const base = { car, pickupLocationId: 'a', dropoffLocationId: 'a' };
    const short = calculatePrice({ ...base, startDate: '2026-10-01', endDate: '2026-10-02' });
    const long = calculatePrice({ ...base, startDate: '2026-10-01', endDate: '2026-10-06' });
    expect(long.totalPrice).toBeGreaterThan(short.totalPrice);
  });
});

describe('rentalDays', () => {
  it('charges at least one day', () => {
    expect(rentalDays('2026-10-01', '2026-10-01')).toBe(1);
  });
});

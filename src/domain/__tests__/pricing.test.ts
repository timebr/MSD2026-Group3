import {
  calculatePrice,
  CURRENCY,
  dailyPriceRange,
  formatDailyRange,
  formatMoney,
  ONE_WAY_FEE,
  rentalDays,
} from '@/domain/pricing';

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

describe('dailyPriceRange', () => {
  it('goes from the car alone to the car with the most expensive insurance', () => {
    expect(dailyPriceRange({ pricePerDay: 50 }, [{ pricePerDay: 0 }, { pricePerDay: 15 }])).toEqual({
      min: 50,
      max: 65,
    });
  });

  it('is a single price when there is no paid insurance', () => {
    expect(formatDailyRange(dailyPriceRange({ pricePerDay: 50 }, []))).toBe('50 DKK / day');
  });

  it('shows both ends of the range when insurance changes the price', () => {
    expect(formatDailyRange({ min: 29, max: 44 })).toBe('29–44 DKK / day');
  });
});

describe('formatMoney', () => {
  it('renders a whole amount with the DKK currency', () => {
    expect(formatMoney(150)).toBe('150 DKK');
    expect(formatMoney(0)).toBe('0 DKK');
  });

  it('uses the shared currency constant', () => {
    expect(formatMoney(250)).toBe(`250 ${CURRENCY}`);
  });
});

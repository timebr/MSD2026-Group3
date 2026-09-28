import type { Car } from '@/models/car';
import type { Insurance } from '@/models/insurance';
import type { PriceBreakdown } from '@/models/booking';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Charged when the car is returned to a different location than it was picked up from. */
export const ONE_WAY_FEE = 250;

export function rentalDays(startDate: string, endDate: string): number {
  return Math.max(1, Math.ceil((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS));
}

/**
 * Single source of truth for what a booking costs, used when booking and when
 * modifying dates, so the stored price always matches the stored dates.
 */
export function calculatePrice(params: {
  car: Pick<Car, 'pricePerDay'>;
  insurance?: Pick<Insurance, 'pricePerDay'>;
  startDate: string;
  endDate: string;
  pickupLocationId: string;
  dropoffLocationId: string;
}): PriceBreakdown {
  const days = rentalDays(params.startDate, params.endDate);
  const basePrice = days * params.car.pricePerDay;
  const insuranceCost = days * (params.insurance?.pricePerDay ?? 0);
  const fees = params.pickupLocationId === params.dropoffLocationId ? 0 : ONE_WAY_FEE;
  return { days, basePrice, insuranceCost, fees, totalPrice: basePrice + insuranceCost + fees };
}

/**
 * Per-day price range shown before dates are chosen: from the car alone to the
 * car with the most expensive insurance (FE#2: no surprises at checkout).
 */
export function dailyPriceRange(
  car: Pick<Car, 'pricePerDay'>,
  insuranceOptions: Pick<Insurance, 'pricePerDay'>[],
): { min: number; max: number } {
  const maxInsurance = Math.max(0, ...insuranceOptions.map((option) => option.pricePerDay));
  return { min: car.pricePerDay, max: car.pricePerDay + maxInsurance };
}

export function formatDailyRange(range: { min: number; max: number }): string {
  return range.min === range.max ? `${range.min} DKK / day` : `${range.min}–${range.max} DKK / day`;
}

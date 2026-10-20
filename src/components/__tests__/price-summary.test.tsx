import { render, screen } from '@testing-library/react-native';

import { PriceSummary } from '@/components/price-summary';
import type { PriceBreakdown } from '@/models/booking';

const price: PriceBreakdown = {
  days: 3,
  basePrice: 87,
  insuranceCost: 20,
  fees: 250,
  totalPrice: 357,
};

describe('PriceSummary', () => {
  it('itemises every charge and the total', async () => {
    await render(<PriceSummary price={price} />);
    expect(screen.getByText('Rental (3 days)')).toBeTruthy();
    expect(screen.getByText('Insurance')).toBeTruthy();
    expect(screen.getByText('One-way fee')).toBeTruthy();
    expect(screen.getByText('Total')).toBeTruthy();
    expect(screen.getByText('87 DKK')).toBeTruthy();
    expect(screen.getByText('20 DKK')).toBeTruthy();
    expect(screen.getByText('250 DKK')).toBeTruthy();
    expect(screen.getByText('357 DKK')).toBeTruthy();
  });

  it('uses the singular day label for a one-day rental', async () => {
    await render(<PriceSummary price={{ ...price, days: 1 }} />);
    expect(screen.getByText('Rental (1 day)')).toBeTruthy();
  });

  it('hides the one-way fee when there is none', async () => {
    await render(<PriceSummary price={{ ...price, fees: 0 }} />);
    expect(screen.queryByText('One-way fee')).toBeNull();
    expect(screen.getByText('Total')).toBeTruthy();
  });
});

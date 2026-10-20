import { renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { CarCard } from '@/components/car-card';
import type { Car } from '@/models/car';
import type { Insurance } from '@/models/insurance';

const car: Car = {
  id: 'car-1',
  brand: 'Volkswagen',
  model: 'Up!',
  type: 'city',
  fuelType: 'petrol',
  transmission: 'manual',
  seats: 4,
  fuelPolicy: 'full-to-full',
  pricePerDay: 29,
  locationId: 'loc-cph-airport',
  imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a',
  description: 'Compact city car, easy to park, great for short trips around town.',
};

const insuranceOptions: Insurance[] = [
  { id: 'ins-basic', name: 'Basic', coverage: 'Third-party liability only', deductible: 1200, pricePerDay: 0 },
  { id: 'ins-full', name: 'Full coverage', coverage: 'Zero deductible', deductible: 0, pricePerDay: 15 },
];

/** The card links through expo-router, so it needs a router context to render. */
async function renderCarCard(options: Insurance[]) {
  const app = renderRouter({ index: () => <CarCard car={car} insuranceOptions={options} /> }, { initialUrl: '/' });
  await app;
}

describe('CarCard', () => {
  it('shows the car name, its specs and the daily price range', async () => {
    await renderCarCard(insuranceOptions);
    await waitFor(() => {
      expect(screen.getByText('Volkswagen Up!')).toBeTruthy();
      expect(screen.getByText('city · petrol · manual · 4 seats')).toBeTruthy();
      expect(screen.getByText('29–44 DKK / day')).toBeTruthy();
    });
  });

  it('labels the card for assistive tech', async () => {
    await renderCarCard(insuranceOptions);
    await waitFor(() => expect(screen.getByLabelText('View details for Volkswagen Up!')).toBeTruthy());
  });

  it('shows a single price when no insurance option adds a daily cost', async () => {
    await renderCarCard([]);
    await waitFor(() => expect(screen.getByText('29 DKK / day')).toBeTruthy());
  });
});

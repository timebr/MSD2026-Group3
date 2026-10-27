import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { carRepository } from '@/api';
import { useCar, useCars, useLocationName, useLocations } from '@/hooks/use-cars';
import type { Car } from '@/models/car';
import type { Location } from '@/models/location';

jest.mock('@/api', () => ({
  carRepository: {
    listCars: jest.fn(),
    getCar: jest.fn(),
    listLocations: jest.fn(),
    listInsurance: jest.fn(),
  },
}));

const mockCarRepository = jest.mocked(carRepository);

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
  description: 'Compact city car.',
};

const locations: Location[] = [
  { id: 'loc-cph-airport', name: 'Copenhagen Airport', address: 'Lufthavnsboulevarden 6, 2770 Kastrup' },
  { id: 'loc-aarhus-station', name: 'Aarhus Central Station', address: 'Banegårdspladsen 1, 8000 Aarhus C' },
];

/** Each test gets a fresh cache; no provider infrastructure is shared. */
function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('use-cars', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCarRepository.listCars.mockResolvedValue([car]);
    mockCarRepository.getCar.mockResolvedValue(car);
    mockCarRepository.listLocations.mockResolvedValue(locations);
  });

  it('loads cars through the repository and passes the filters and sort', async () => {
    const filters = { type: 'city' as const };
    const { result } = await renderHook(() => useCars(filters, 'price-asc'), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual([car]));
    expect(mockCarRepository.listCars).toHaveBeenCalledWith(filters, 'price-asc');
  });

  it('serves a second hook with the same key from the cache', async () => {
    const filters = { type: 'city' as const };
    const { rerender } = await renderHook(() => useCars(filters, 'price-asc'), { wrapper });
    await waitFor(() => expect(mockCarRepository.listCars).toHaveBeenCalledTimes(1));

    await rerender({});
    expect(mockCarRepository.listCars).toHaveBeenCalledTimes(1);
  });

  it('does not fetch a car without an id', async () => {
    const { result } = await renderHook(() => useCar(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockCarRepository.getCar).not.toHaveBeenCalled();
  });

  it('loads a single car by id', async () => {
    const { result } = await renderHook(() => useCar('car-1'), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(car));
    expect(mockCarRepository.getCar).toHaveBeenCalledWith('car-1');
  });

  it('resolves a location name and falls back to the id', async () => {
    const { result } = await renderHook(() => useLocationName(), { wrapper });
    await waitFor(() => expect(result.current('loc-cph-airport')).toBe('Copenhagen Airport'));
    expect(result.current('unknown-id')).toBe('unknown-id');
  });

  it('loads the location list', async () => {
    const { result } = await renderHook(() => useLocations(), { wrapper });
    await waitFor(() => expect(result.current.data).toEqual(locations));
  });
});

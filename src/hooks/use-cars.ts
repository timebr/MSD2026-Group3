import { useQuery } from '@tanstack/react-query';

import { carRepository } from '@/api';
import { carKeys } from '@/api/queryKeys';
import type { CarFilters, CarSort } from '@/models/car';

export function useCars(filters?: CarFilters, sort?: CarSort) {
  return useQuery({
    queryKey: carKeys.list(filters, sort),
    queryFn: () => carRepository.listCars(filters, sort),
  });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: carKeys.detail(id ?? ''),
    queryFn: async () => (await carRepository.getCar(id as string)) ?? null,
    enabled: Boolean(id),
  });
}

export function useLocations() {
  return useQuery({ queryKey: carKeys.locations, queryFn: () => carRepository.listLocations() });
}

export function useInsurance() {
  return useQuery({ queryKey: carKeys.insurance, queryFn: () => carRepository.listInsurance() });
}

/** Looks up a location's display name, falling back to the id while loading. */
export function useLocationName(): (id: string) => string {
  const { data: locations = [] } = useLocations();
  return (id) => locations.find((location) => location.id === id)?.name ?? id;
}

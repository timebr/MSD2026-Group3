import { useQuery } from '@tanstack/react-query';

import { carRepository } from '@/api';
import type { CarFilters, CarSort } from '@/models/car';

export function useCars(filters?: CarFilters, sort?: CarSort) {
  return useQuery({
    queryKey: ['cars', filters, sort],
    queryFn: () => carRepository.listCars(filters, sort),
  });
}

export function useCar(id: string | undefined) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carRepository.getCar(id as string),
    enabled: Boolean(id),
  });
}

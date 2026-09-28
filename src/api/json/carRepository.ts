import type { CarRepository } from '@/api/types';
import carsFixture from '@/data/cars.json';
import type { Car, CarFilters, CarSort } from '@/models/car';

const cars = carsFixture as Car[];

// Mimics network latency so loading states are exercised even against the
// local fixture, while staying well under NFR4's 1s dummy-data budget.
const FIXTURE_LATENCY_MS = 150;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), FIXTURE_LATENCY_MS));
}

function applyFilters(list: Car[], filters?: CarFilters): Car[] {
  if (!filters) return list;
  return list.filter((car) => {
    if (filters.location && car.location !== filters.location) return false;
    if (filters.type && car.type !== filters.type) return false;
    if (filters.maxPricePerDay !== undefined && car.pricePerDay > filters.maxPricePerDay) return false;
    return true;
  });
}

function applySort(list: Car[], sort?: CarSort): Car[] {
  if (!sort) return list;
  const sorted = [...list];
  sorted.sort((a, b) => (sort === 'price-asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay));
  return sorted;
}

export class JsonCarRepository implements CarRepository {
  async listCars(filters?: CarFilters, sort?: CarSort): Promise<Car[]> {
    return delay(applySort(applyFilters(cars, filters), sort));
  }

  async getCar(id: string): Promise<Car | undefined> {
    return delay(cars.find((car) => car.id === id));
  }
}

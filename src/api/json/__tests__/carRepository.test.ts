import { JsonCarRepository } from '@/api/json/carRepository';

describe('JsonCarRepository', () => {
  const repository = new JsonCarRepository();

  it('lists all cars from the fixture', async () => {
    const cars = await repository.listCars();
    expect(cars.length).toBeGreaterThan(0);
  });

  it('gets a car by id', async () => {
    const [first] = await repository.listCars();
    const found = await repository.getCar(first.id);
    expect(found?.id).toBe(first.id);
  });

  it('returns undefined for an unknown id', async () => {
    const found = await repository.getCar('does-not-exist');
    expect(found).toBeUndefined();
  });

  it('filters by type', async () => {
    const suvs = await repository.listCars({ type: 'suv' });
    expect(suvs.every((car) => car.type === 'suv')).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const cars = await repository.listCars(undefined, 'price-asc');
    const prices = cars.map((car) => car.pricePerDay);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
});

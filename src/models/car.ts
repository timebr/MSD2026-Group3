export type FuelPolicy = 'full-to-full' | 'full-to-empty' | 'pre-purchase';

export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';

export type CarType = 'city' | 'suv' | 'estate' | 'van' | 'luxury';

export interface Car {
  id: string;
  brand: string;
  model: string;
  type: CarType;
  fuelType: FuelType;
  transmission: 'manual' | 'automatic';
  seats: number;
  fuelPolicy: FuelPolicy; // FE#5, persona 2 (F5)
  pricePerDay: number;
  locationId: string;
  imageUrl: string;
  description: string;
}

export interface CarFilters {
  locationId?: string;
  type?: CarType;
  maxPricePerDay?: number;
}

export type CarSort = 'price-asc' | 'price-desc';

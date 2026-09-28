export type FuelPolicy = 'full-to-full' | 'full-to-empty' | 'pre-purchase';

export type CarType = 'city' | 'suv' | 'estate' | 'van' | 'luxury';

export interface InsuranceOption {
  id: string;
  name: string;
  coverageSummary: string;
  deductible: number;
  pricePerDay: number;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  type: CarType;
  transmission: 'manual' | 'automatic';
  seats: number;
  luggageCapacity: string;
  fuelPolicy: FuelPolicy;
  isElectric: boolean;
  hasCarPlay: boolean;
  pricePerDay: number;
  location: string;
  imageUrl: string;
  description: string;
  insuranceOptions: InsuranceOption[];
}

export interface CarFilters {
  location?: string;
  type?: CarType;
  maxPricePerDay?: number;
}

export type CarSort = 'price-asc' | 'price-desc';

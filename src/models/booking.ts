export type BookingStatus = 'confirmed' | 'modified' | 'cancelled';

/**
 * Distinct from BookingStatus: this tracks whether the *local* write has
 * reached the backend yet (NFR2/NFR3 — resilient writes + sync transparency).
 */
export type SyncState = 'synced' | 'pending' | 'failed';

export interface PaymentDetails {
  cardholderName: string;
  cardNumberLast4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface Booking {
  id: string;
  carId: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  insuranceOptionId?: string;
  totalPrice: number;
  payment: PaymentDetails;
  status: BookingStatus;
  syncState: SyncState;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface CreateBookingInput {
  carId: string;
  pickupLocation: string;
  dropoffLocation: string;
  startDate: string;
  endDate: string;
  insuranceOptionId?: string;
  totalPrice: number;
  payment: PaymentDetails;
}

export type UpdateBookingInput = Partial<Pick<Booking, 'pickupLocation' | 'dropoffLocation' | 'startDate' | 'endDate'>>;

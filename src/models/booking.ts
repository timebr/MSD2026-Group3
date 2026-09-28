export type BookingStatus = 'confirmed' | 'cancelled';

/**
 * Distinct from BookingStatus: this tracks whether the *local* write has
 * reached the backend yet (NFR2/NFR3 — resilient writes + sync transparency).
 */
export type SyncState = 'synced' | 'pending' | 'failed';

/** Itemised price, shown at checkout and on the booking (FE#2, OBJ-2). */
export interface PriceBreakdown {
  days: number;
  basePrice: number;
  insuranceCost: number;
  fees: number;
  totalPrice: number;
}

/**
 * Mock checkout result. Card details are validated on the checkout form and
 * then discarded; only what the data model's Payment needs is stored.
 */
export interface Payment {
  method: 'card';
  amount: number;
  status: 'paid';
}

export interface Booking {
  id: string;
  carId: string;
  pickupLocationId: string;
  dropoffLocationId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  insuranceId?: string;
  price: PriceBreakdown;
  payment: Payment;
  status: BookingStatus;
  syncState: SyncState;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export type CreateBookingInput = Pick<
  Booking,
  'carId' | 'pickupLocationId' | 'dropoffLocationId' | 'startDate' | 'endDate' | 'insuranceId' | 'price' | 'payment'
>;

export type UpdateBookingInput = Partial<Pick<Booking, 'startDate' | 'endDate' | 'price'>>;

/** A booking before checkout: everything except the payment. */
export type BookingDraft = Omit<CreateBookingInput, 'payment'>;

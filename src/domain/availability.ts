import type { Booking } from '@/models/booking';

/** True when [aStart, aEnd) and [bStart, bEnd) overlap; a return on day X frees the car for a pick-up on day X. */
export function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bStart) < Date.parse(aEnd);
}

/**
 * A car is available for a date range when no other active booking of it
 * overlaps that range (FR1: only *available* cars can be booked).
 */
export function isCarAvailable(
  bookings: Booking[],
  carId: string,
  startDate: string,
  endDate: string,
  ignoreBookingId?: string,
): boolean {
  return !bookings.some(
    (booking) =>
      booking.carId === carId &&
      booking.id !== ignoreBookingId &&
      booking.status !== 'cancelled' &&
      datesOverlap(startDate, endDate, booking.startDate, booking.endDate),
  );
}

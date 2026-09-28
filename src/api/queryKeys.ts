export const bookingKeys = {
  list: ['bookings'] as const,
  detail: (id: string) => ['booking', id] as const,
};

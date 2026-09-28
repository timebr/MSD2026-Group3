export const carKeys = {
  all: ['cars'] as const,
  list: (filters: unknown, sort: unknown) => ['cars', 'list', filters, sort] as const,
  detail: (id: string) => ['cars', 'detail', id] as const,
  locations: ['cars', 'locations'] as const,
  insurance: ['cars', 'insurance'] as const,
};

// Everything under ['bookings'] is excluded from the persisted query cache:
// the local booking repository is already the source of truth on disk.
export const bookingKeys = {
  all: ['bookings'] as const,
  list: ['bookings', 'list'] as const,
  detail: (id: string) => ['bookings', 'detail', id] as const,
};

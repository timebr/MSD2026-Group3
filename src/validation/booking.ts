import { z } from 'zod';

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

export const bookingFormSchema = z
  .object({
    pickupLocation: z.string().trim().min(1, 'Pick-up location is required'),
    dropoffLocation: z.string().trim().min(1, 'Drop-off location is required'),
    startDate: isoDate,
    endDate: isoDate,
    insuranceOptionId: z.string().optional(),
  })
  .refine((data) => Date.parse(data.endDate) > Date.parse(data.startDate), {
    message: 'Return date must be after the pick-up date',
    path: ['endDate'],
  })
  .refine((data) => Date.parse(data.startDate) >= Date.now() - 24 * 60 * 60 * 1000, {
    message: 'Pick-up date cannot be in the past',
    path: ['startDate'],
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

import { z } from 'zod';

const isoDate = z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date');

const dateFields = {
  startDate: isoDate,
  endDate: isoDate,
};

// Shared by the booking form and the "modify dates" form so both apply the
// same rules (NFR5).
function checkDates(data: { startDate: string; endDate: string }, ctx: z.RefinementCtx) {
  if (Date.parse(data.endDate) <= Date.parse(data.startDate)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Return date must be after the pick-up date',
      path: ['endDate'],
    });
  }
  if (Date.parse(data.startDate) < Date.now() - 24 * 60 * 60 * 1000) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Pick-up date cannot be in the past', path: ['startDate'] });
  }
}

export const bookingDatesSchema = z.object(dateFields).superRefine(checkDates);

export const bookingFormSchema = z
  .object({
    pickupLocationId: z.string().min(1, 'Choose a pick-up location'),
    dropoffLocationId: z.string().min(1, 'Choose a drop-off location'),
    ...dateFields,
    insuranceId: z.string().optional(),
  })
  .superRefine(checkDates);

export type BookingDatesValues = z.infer<typeof bookingDatesSchema>;
export type BookingFormValues = z.infer<typeof bookingFormSchema>;

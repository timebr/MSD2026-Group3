import { z } from 'zod';

// FR6 is a mock checkout — this validates *shape*, not a real card (no
// gateway, nothing is charged or transmitted).
export const paymentFormSchema = z
  .object({
    cardholderName: z.string().trim().min(1, 'Cardholder name is required'),
    cardNumber: z
      .string()
      .trim()
      .regex(/^\d{16}$/, 'Card number must be 16 digits'),
    expiryMonth: z.coerce
      .number({ invalid_type_error: 'Expiry month is required' })
      .int('Expiry month must be a whole number')
      .min(1, 'Expiry month must be between 1 and 12')
      .max(12, 'Expiry month must be between 1 and 12'),
    expiryYear: z.coerce
      .number({ invalid_type_error: 'Expiry year is required' })
      .int('Expiry year must be a whole number')
      .min(new Date().getFullYear(), 'Expiry year cannot be in the past'),
    cvv: z
      .string()
      .trim()
      .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  })
  .refine(
    (data) => {
      const now = new Date();
      const expiry = new Date(data.expiryYear, data.expiryMonth - 1, 1);
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return expiry >= currentMonth;
    },
    { message: 'Card has expired', path: ['expiryYear'] },
  );

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

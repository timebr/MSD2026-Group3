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
    expiryMonth: z.coerce.number().int().min(1).max(12),
    expiryYear: z.coerce.number().int().min(new Date().getFullYear()),
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

import { paymentFormSchema } from '@/validation/payment';

const now = new Date();
const currentYear = now.getFullYear();
const nextYear = currentYear + 1;

const valid = {
  cardholderName: 'Elena',
  cardNumber: '4242424242424242',
  expiryMonth: '12',
  expiryYear: String(nextYear),
  cvv: '123',
};

describe('paymentFormSchema', () => {
  it('accepts a valid card with a future expiry', () => {
    expect(paymentFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects a blank or whitespace-only cardholder name', () => {
    expect(paymentFormSchema.safeParse({ ...valid, cardholderName: '' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cardholderName: '   ' }).success).toBe(false);
  });

  it('rejects a card number that is not 16 digits', () => {
    expect(paymentFormSchema.safeParse({ ...valid, cardNumber: '424242424242424' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cardNumber: '42424242424242421' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cardNumber: '424242424242424a' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cardNumber: '' }).success).toBe(false);
    const result = paymentFormSchema.safeParse({ ...valid, cardNumber: '4242' });
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Card number must be 16 digits');
    }
  });

  it('rejects an expiry month outside 1–12 or not a whole number', () => {
    expect(paymentFormSchema.safeParse({ ...valid, expiryMonth: '0' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, expiryMonth: '13' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, expiryMonth: '6.5' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, expiryMonth: '' }).success).toBe(false);

    const outOfRange = paymentFormSchema.safeParse({ ...valid, expiryMonth: '13' });
    if (!outOfRange.success) {
      expect(outOfRange.error.issues[0].message).toBe('Expiry month must be between 1 and 12');
    }
    const fraction = paymentFormSchema.safeParse({ ...valid, expiryMonth: '6.5' });
    if (!fraction.success) {
      expect(fraction.error.issues[0].message).toBe('Expiry month must be a whole number');
    }
  });

  it('rejects an expiry year before the current year', () => {
    const result = paymentFormSchema.safeParse({ ...valid, expiryYear: String(currentYear - 1) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Expiry year cannot be in the past');
    }
  });

  it('rejects the current year with a past month as expired', () => {
    // `getMonth()` is 0-based, so its value is also the previous month's 1-based number.
    // In January there is no past month inside the current year, so the
    // schema's min() on the year covers that case instead.
    const { year, month, inYear } =
      now.getMonth() > 0
        ? { year: currentYear, month: now.getMonth(), inYear: true }
        : { year: currentYear - 1, month: 12, inYear: false };
    const result = paymentFormSchema.safeParse({ ...valid, expiryYear: String(year), expiryMonth: String(month) });
    expect(result.success).toBe(false);
    if (!result.success && inYear) {
      expect(result.error.issues.some((issue) => issue.message === 'Card has expired')).toBe(true);
    }
  });

  it('accepts the current month, whose expiry is still valid', () => {
    const result = paymentFormSchema.safeParse({
      ...valid,
      expiryYear: String(currentYear),
      expiryMonth: String(now.getMonth() + 1),
    });
    expect(result.success).toBe(true);
  });

  it('accepts expiry month and year given as numbers', () => {
    const result = paymentFormSchema.safeParse({ ...valid, expiryMonth: 12, expiryYear: nextYear });
    expect(result.success).toBe(true);
  });

  it('rejects a CVV that is not 3 or 4 digits', () => {
    expect(paymentFormSchema.safeParse({ ...valid, cvv: '12' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cvv: '12345' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cvv: 'abc' }).success).toBe(false);
    expect(paymentFormSchema.safeParse({ ...valid, cvv: '1234' }).success).toBe(true);
  });
});

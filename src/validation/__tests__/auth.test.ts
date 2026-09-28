import { logInSchema, signUpSchema } from '@/validation/auth';

describe('auth schemas', () => {
  it('accepts a valid sign-up', () => {
    expect(
      signUpSchema.safeParse({ name: 'Hannes', email: 'hannes@example.com', password: 'longenough' }).success,
    ).toBe(true);
  });

  it('rejects a short password or a bad email on sign-up', () => {
    expect(signUpSchema.safeParse({ name: 'Hannes', email: 'hannes@example.com', password: 'short' }).success).toBe(
      false,
    );
    expect(signUpSchema.safeParse({ name: 'Hannes', email: 'not-an-email', password: 'longenough' }).success).toBe(
      false,
    );
  });

  it('only needs email and password to log in', () => {
    expect(logInSchema.safeParse({ email: 'hannes@example.com', password: 'x' }).success).toBe(true);
  });
});

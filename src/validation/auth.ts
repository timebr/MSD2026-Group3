import { z } from 'zod';

export const logInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = logInSchema.extend({
  name: z.string().trim().min(1, 'Enter your name'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export type LogInValues = z.infer<typeof logInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;

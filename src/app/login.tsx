import { zodResolver } from '@hookform/resolvers/zod';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, type TextInputProps } from 'react-native';
import { z } from 'zod';

import { EmailTakenError, InvalidCredentialsError } from '@/api/types';
import { Button } from '@/components/button';
import { TextInput } from '@/components/text-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { logInSchema, signUpSchema, type SignUpValues } from '@/validation/auth';

type Mode = 'login' | 'signup';

/**
 * S3 Login / Sign up. Opened from the welcome screen, from checkout ("Tap Pay +
 * not logged in") and from My bookings; afterwards it returns to where the
 * user came from.
 */
export default function LoginScreen() {
  const params = useLocalSearchParams<{ mode?: Mode; from?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'signup' ? 'signup' : 'login');

  // Remount the form when switching modes so each gets its own validation.
  return <AuthForm key={mode} mode={mode} onSwitchMode={setMode} fromWelcome={params.from === 'welcome'} />;
}

function AuthForm({
  mode,
  onSwitchMode,
  fromWelcome,
}: {
  mode: Mode;
  onSwitchMode: (mode: Mode) => void;
  fromWelcome: boolean;
}) {
  const { logIn, signUp } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSignUp = mode === 'signup';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    // Both modes share one form; logging in just leaves the name empty.
    resolver: zodResolver(isSignUp ? signUpSchema : logInSchema.extend({ name: z.string() })),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: SignUpValues) => {
    setSubmitError(null);
    try {
      if (isSignUp) {
        await signUp(values);
      } else {
        await logIn(values);
      }
      if (fromWelcome) {
        router.replace('/');
      } else {
        router.back();
      }
    } catch (error) {
      setSubmitError(
        error instanceof EmailTakenError || error instanceof InvalidCredentialsError
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  };

  const field = (name: keyof SignUpValues, label: string, props: TextInputProps = {}) => (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            accessibilityLabel={label}
            error={errors[name]?.message}
            {...props}
          />
        )}
      />
    </ThemedView>
  );

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: isSignUp ? 'Create account' : 'Log in' }} />

      {isSignUp && field('name', 'Name', { autoComplete: 'name' })}
      {field('email', 'Email', { autoCapitalize: 'none', autoComplete: 'email', keyboardType: 'email-address' })}
      {field('password', 'Password', {
        secureTextEntry: true,
        autoComplete: isSignUp ? 'new-password' : 'current-password',
      })}

      {submitError && (
        <ThemedText type="small" themeColor="error">
          {submitError}
        </ThemedText>
      )}

      <Button
        label={isSignUp ? 'Create account' : 'Log in'}
        variant="primary"
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
      />

      <Pressable
        onPress={() => onSwitchMode(isSignUp ? 'login' : 'signup')}
        accessibilityRole="button"
        accessibilityLabel={isSignUp ? 'I already have an account' : 'Create a new account'}
        style={styles.switch}
      >
        <ThemedText type="link">
          {isSignUp ? 'Already have an account? Log in' : 'New here? Create an account'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  switch: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

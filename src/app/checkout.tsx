import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { CarUnavailableError } from '@/api/types';
import { PriceSummary } from '@/components/price-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCreateBooking } from '@/hooks/use-bookings';
import { useTheme } from '@/hooks/use-theme';
import type { BookingDraft } from '@/models/booking';
import { paymentFormSchema, type PaymentFormValues } from '@/validation/payment';

export default function CheckoutScreen() {
  const { draft } = useLocalSearchParams<{ draft: string }>();
  const theme = useTheme();
  const createBooking = useCreateBooking();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const bookingDraft = useMemo<BookingDraft | null>(() => {
    try {
      return draft ? (JSON.parse(draft) as BookingDraft) : null;
    } catch {
      return null;
    }
  }, [draft]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: undefined,
      expiryYear: undefined,
      cvv: '',
    },
  });

  if (!bookingDraft) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Missing booking details — please start again from the car list.</ThemedText>
      </ThemedView>
    );
  }

  // The card fields are only validated (mock checkout, FR6) and then discarded;
  // the booking stores method, amount and status like the data model's Payment.
  const onSubmit = async (_card: PaymentFormValues) => {
    setSubmitError(null);
    try {
      const booking = await createBooking.mutateAsync({
        ...bookingDraft,
        payment: { method: 'card', amount: bookingDraft.price.totalPrice, status: 'paid' },
      });
      router.replace({ pathname: '/bookings/[id]', params: { id: booking.id, confirmed: '1' } });
    } catch (error) {
      setSubmitError(
        error instanceof CarUnavailableError
          ? 'This car is no longer available for those dates. Go back and pick other dates.'
          : "Couldn't complete checkout. Please try again.",
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <PriceSummary price={bookingDraft.price} />

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Cardholder name</ThemedText>
        <Controller
          control={control}
          name="cardholderName"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Cardholder name"
            />
          )}
        />
        {errors.cardholderName && <ThemedText type="small">{errors.cardholderName.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Card number</ThemedText>
        <Controller
          control={control}
          name="cardNumber"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="number-pad"
              maxLength={16}
              placeholder="4242424242424242"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Card number"
            />
          )}
        />
        {errors.cardNumber && <ThemedText type="small">{errors.cardNumber.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.row}>
        <ThemedView style={[styles.field, styles.flex1]}>
          <ThemedText type="smallBold">Expiry month</ThemedText>
          <Controller
            control={control}
            name="expiryMonth"
            render={({ field }) => (
              <TextInput
                value={field.value?.toString() ?? ''}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="MM"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                accessibilityLabel="Card expiry month"
              />
            )}
          />
        </ThemedView>

        <ThemedView style={[styles.field, styles.flex1]}>
          <ThemedText type="smallBold">Expiry year</ThemedText>
          <Controller
            control={control}
            name="expiryYear"
            render={({ field }) => (
              <TextInput
                value={field.value?.toString() ?? ''}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                maxLength={4}
                placeholder="YYYY"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                accessibilityLabel="Card expiry year"
              />
            )}
          />
        </ThemedView>

        <ThemedView style={[styles.field, styles.flex1]}>
          <ThemedText type="smallBold">CVV</ThemedText>
          <Controller
            control={control}
            name="cvv"
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                accessibilityLabel="Card CVV"
              />
            )}
          />
        </ThemedView>
      </ThemedView>
      {(errors.expiryMonth || errors.expiryYear || errors.cvv) && (
        <ThemedText type="small">
          {errors.expiryMonth?.message || errors.expiryYear?.message || errors.cvv?.message}
        </ThemedText>
      )}

      {submitError && <ThemedText type="small">{submitError}</ThemedText>}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={createBooking.isPending}
        accessibilityRole="button"
        accessibilityLabel="Confirm and pay"
      >
        <ThemedView type="backgroundSelected" style={styles.submitButton}>
          <ThemedText type="smallBold">{createBooking.isPending ? 'Processing…' : 'Confirm and pay'}</ThemedText>
        </ThemedView>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex1: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});

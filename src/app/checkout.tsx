import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';

import { CarUnavailableError } from '@/api/types';
import { Button } from '@/components/button';
import { PriceSummary } from '@/components/price-summary';
import { TextInput } from '@/components/text-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useCreateBooking } from '@/hooks/use-bookings';
import type { BookingDraft } from '@/models/booking';
import { paymentFormSchema, type PaymentFormValues } from '@/validation/payment';

export default function CheckoutScreen() {
  const { draft } = useLocalSearchParams<{ draft: string }>();
  const { user } = useAuth();
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
    if (!user) {
      // Guests can browse, but a booking needs an account ("Tap Pay + not logged in" → S3).
      router.push({ pathname: '/login', params: { mode: 'signup' } });
      return;
    }
    try {
      const booking = await createBooking.mutateAsync({
        ...bookingDraft,
        userId: user.id,
        payment: { method: 'card', amount: bookingDraft.price.totalPrice, status: 'paid' },
      });
      // Back to the car overview (S1), closing the car, booking and checkout
      // screens; the list shows a confirmation with a link to the booking.
      router.dismissTo({ pathname: '/', params: { confirmedBookingId: booking.id } });
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

      {!user && (
        <ThemedView type="surface" style={styles.notice}>
          <ThemedText type="small">
            You&apos;re browsing as a guest. You&apos;ll be asked to log in or create an account when you pay.
          </ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Cardholder name</ThemedText>
        <Controller
          control={control}
          name="cardholderName"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              accessibilityLabel="Cardholder name"
              error={errors.cardholderName?.message}
            />
          )}
        />
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
              accessibilityLabel="Card number"
              error={errors.cardNumber?.message}
            />
          )}
        />
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
                accessibilityLabel="Card CVV"
              />
            )}
          />
        </ThemedView>
      </ThemedView>
      {(errors.expiryMonth || errors.expiryYear || errors.cvv) && (
        <ThemedText type="small" themeColor="error">
          {errors.expiryMonth?.message || errors.expiryYear?.message || errors.cvv?.message}
        </ThemedText>
      )}

      {submitError && (
        <ThemedText type="small" themeColor="error">
          {submitError}
        </ThemedText>
      )}

      <Button
        label={createBooking.isPending ? 'Processing…' : user ? 'Confirm and pay' : 'Log in to pay'}
        variant="primary"
        onPress={handleSubmit(onSubmit)}
        disabled={createBooking.isPending}
        accessibilityLabel={user ? 'Confirm and pay' : 'Log in to pay'}
      />
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
  notice: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
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
});

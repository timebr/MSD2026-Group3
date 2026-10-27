import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, Surface, Text, TextInput } from 'react-native-paper';

import { CarUnavailableError } from '@/api/types';
import { PriceSummary } from '@/components/price-summary';
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
      <Surface style={styles.center} elevation={0}>
        <Text variant="bodyLarge">Missing booking details — please start again from the car list.</Text>
      </Surface>
    );
  }

  // The card fields are only validated (mock checkout, FR6) and then discarded;
  // the booking stores method, amount and status like the data model's Payment.
  const onSubmit = async () => {
    setSubmitError(null);
    if (!user) {
      // Guests can browse, but a booking needs an account ("Tap Pay + not logged in" → S3).
      router.push({ pathname: '/login', params: { mode: 'login' } });
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
    <Surface style={styles.container} elevation={0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PriceSummary price={bookingDraft.price} />

        {!user && (
          <Card mode="contained" style={styles.notice}>
            <Card.Content>
              <Text variant="bodySmall">
                You&apos;re browsing as a guest. You&apos;ll be asked to log in or create an account when you pay.
              </Text>
            </Card.Content>
          </Card>
        )}

        <View style={styles.field}>
          <Controller
            control={control}
            name="cardholderName"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Cardholder name"
                value={field.value}
                onChangeText={field.onChange}
                error={Boolean(errors.cardholderName)}
                accessibilityLabel="Cardholder name"
              />
            )}
          />
          {errors.cardholderName && (
            <HelperText type="error" padding="none">
              {errors.cardholderName.message}
            </HelperText>
          )}
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="cardNumber"
            render={({ field }) => (
              <TextInput
                mode="outlined"
                label="Card number"
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="number-pad"
                maxLength={16}
                placeholder="4242424242424242"
                error={Boolean(errors.cardNumber)}
                accessibilityLabel="Card number"
              />
            )}
          />
          {errors.cardNumber && (
            <HelperText type="error" padding="none">
              {errors.cardNumber.message}
            </HelperText>
          )}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.flex1]}>
            <Controller
              control={control}
              name="expiryMonth"
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="Expiry month"
                  value={field.value?.toString() ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  error={Boolean(errors.expiryMonth)}
                  accessibilityLabel="Card expiry month"
                />
              )}
            />
          </View>

          <View style={[styles.field, styles.flex1]}>
            <Controller
              control={control}
              name="expiryYear"
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="Expiry year"
                  value={field.value?.toString() ?? ''}
                  onChangeText={field.onChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="YYYY"
                  error={Boolean(errors.expiryYear)}
                  accessibilityLabel="Card expiry year"
                />
              )}
            />
          </View>

          <View style={[styles.field, styles.flex1]}>
            <Controller
              control={control}
              name="cvv"
              render={({ field }) => (
                <TextInput
                  mode="outlined"
                  label="CVV"
                  value={field.value}
                  onChangeText={field.onChange}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  error={Boolean(errors.cvv)}
                  accessibilityLabel="Card CVV"
                />
              )}
            />
          </View>
        </View>
        {(errors.expiryMonth || errors.expiryYear || errors.cvv) && (
          <HelperText type="error" padding="none">
            {errors.expiryMonth?.message || errors.expiryYear?.message || errors.cvv?.message}
          </HelperText>
        )}

        {submitError && (
          <HelperText type="error" padding="none">
            {submitError}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={createBooking.isPending}
          disabled={createBooking.isPending}
          accessibilityRole="button"
          accessibilityLabel={user ? 'Confirm and pay' : 'Log in to pay'}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          {createBooking.isPending ? 'Processing…' : user ? 'Confirm and pay' : 'Log in to pay'}
        </Button>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  },
  field: {
    gap: Spacing.half,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  flex1: {
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  submitButtonContent: {
    paddingVertical: Spacing.one,
  },
});

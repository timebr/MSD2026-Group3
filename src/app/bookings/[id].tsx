import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { CarUnavailableError } from '@/api/types';
import { PriceSummary } from '@/components/price-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { calculatePrice } from '@/domain/pricing';
import { useBooking, useCancelBooking, useUpdateBooking } from '@/hooks/use-bookings';
import { useCar, useInsurance, useLocationName } from '@/hooks/use-cars';
import { useTheme } from '@/hooks/use-theme';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';
import { bookingDatesSchema, type BookingDatesValues } from '@/validation/booking';

export default function BookingDetailScreen() {
  const { id, confirmed } = useLocalSearchParams<{ id: string; confirmed?: string }>();
  const theme = useTheme();
  const { data: booking, isLoading } = useBooking(id);
  const { data: car } = useCar(booking?.carId);
  const { data: insuranceOptions = [] } = useInsurance();
  const locationName = useLocationName();
  const isOnline = useIsOnline();
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingDatesValues>({
    resolver: zodResolver(bookingDatesSchema),
    defaultValues: { startDate: '', endDate: '' },
  });

  useEffect(() => {
    if (booking) {
      reset({ startDate: booking.startDate.slice(0, 10), endDate: booking.endDate.slice(0, 10) });
    }
  }, [booking, reset]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (!booking) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Booking not found.</ThemedText>
      </ThemedView>
    );
  }

  const onSaveDates = async (dates: BookingDatesValues) => {
    if (!car) return;
    setSaveError(null);
    // New dates mean a new price; recalculated with the same rules as booking.
    const price = calculatePrice({
      car,
      insurance: insuranceOptions.find((option) => option.id === booking.insuranceId),
      startDate: dates.startDate,
      endDate: dates.endDate,
      pickupLocationId: booking.pickupLocationId,
      dropoffLocationId: booking.dropoffLocationId,
    });
    try {
      await updateBooking.mutateAsync({ id: booking.id, patch: { ...dates, price } });
      setEditing(false);
    } catch (error) {
      setSaveError(
        error instanceof CarUnavailableError
          ? 'The car is already booked for some of those dates.'
          : "Couldn't save the new dates. Please try again.",
      );
    }
  };

  const onCancel = () => {
    Alert.alert('Cancel booking', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep booking', style: 'cancel' },
      {
        text: 'Cancel booking',
        style: 'destructive',
        onPress: async () => {
          await cancelBooking.mutateAsync(booking.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {confirmed === '1' && (
        <ThemedView type="backgroundElement" style={styles.confirmedBanner}>
          <ThemedText type="smallBold">Booking confirmed!</ThemedText>
        </ThemedView>
      )}

      {car && (
        <ThemedText type="subtitle">
          {car.brand} {car.model}
        </ThemedText>
      )}

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">Status</ThemedText>
        <ThemedText type="small">
          {booking.status}
          {booking.syncState === 'pending' ? ' · waiting to sync' : ''}
          {booking.syncState === 'failed' ? ' · sync failed' : ''}
        </ThemedText>
        {booking.syncState === 'failed' && isOnline && (
          <Pressable onPress={() => requestSync()} accessibilityRole="button" accessibilityLabel="Retry sync">
            <ThemedText type="smallBold">Retry</ThemedText>
          </Pressable>
        )}
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">Route</ThemedText>
        <ThemedText type="small">
          {locationName(booking.pickupLocationId)} → {locationName(booking.dropoffLocationId)}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">Dates</ThemedText>
        {!editing ? (
          <ThemedText type="small">
            {booking.startDate.slice(0, 10)} – {booking.endDate.slice(0, 10)}
          </ThemedText>
        ) : (
          <ThemedView style={styles.editRow}>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  style={[styles.input, styles.flex1, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  accessibilityLabel="Pick-up date"
                />
              )}
            />
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  style={[styles.input, styles.flex1, { color: theme.text, borderColor: theme.backgroundSelected }]}
                  accessibilityLabel="Return date"
                />
              )}
            />
          </ThemedView>
        )}
        {(errors.startDate || errors.endDate) && (
          <ThemedText type="small">{errors.startDate?.message || errors.endDate?.message}</ThemedText>
        )}
        {saveError && <ThemedText type="small">{saveError}</ThemedText>}
      </ThemedView>

      <PriceSummary price={booking.price} />

      {booking.status !== 'cancelled' && (
        <ThemedView style={styles.actions}>
          {editing ? (
            <Pressable onPress={handleSubmit(onSaveDates)} accessibilityRole="button" accessibilityLabel="Save dates">
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="smallBold">Save dates</ThemedText>
              </ThemedView>
            </Pressable>
          ) : (
            <Pressable onPress={() => setEditing(true)} accessibilityRole="button" accessibilityLabel="Modify dates">
              <ThemedView type="backgroundSelected" style={styles.actionButton}>
                <ThemedText type="smallBold">Modify dates</ThemedText>
              </ThemedView>
            </Pressable>
          )}

          <Pressable onPress={onCancel} accessibilityRole="button" accessibilityLabel="Cancel booking">
            <ThemedView type="backgroundElement" style={styles.actionButton}>
              <ThemedText type="smallBold">Cancel booking</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  confirmedBanner: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    alignItems: 'center',
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  editRow: {
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
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});

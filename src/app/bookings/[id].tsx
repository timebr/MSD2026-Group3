import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { z } from 'zod';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useBooking, useCancelBooking, useUpdateBooking } from '@/hooks/use-bookings';
import { useCar } from '@/hooks/use-cars';
import { useTheme } from '@/hooks/use-theme';

const dateEditSchema = z
  .object({
    startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
    endDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date'),
  })
  .refine((data) => Date.parse(data.endDate) > Date.parse(data.startDate), {
    message: 'Return date must be after the pick-up date',
    path: ['endDate'],
  });

type DateEditValues = z.infer<typeof dateEditSchema>;

export default function BookingDetailScreen() {
  const { id, confirmed } = useLocalSearchParams<{ id: string; confirmed?: string }>();
  const theme = useTheme();
  const { data: booking, isLoading } = useBooking(id);
  const { data: car } = useCar(booking?.carId);
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();
  const [editing, setEditing] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DateEditValues>({
    resolver: zodResolver(dateEditSchema),
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

  const onSaveDates = async (values: DateEditValues) => {
    await updateBooking.mutateAsync({ id: booking.id, patch: values });
    setEditing(false);
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
          {car.make} {car.model}
        </ThemedText>
      )}

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">Status</ThemedText>
        <ThemedText type="small">
          {booking.status}
          {booking.syncState !== 'synced' ? ` · ${booking.syncState}` : ''}
        </ThemedText>
      </ThemedView>

      <ThemedView type="backgroundElement" style={styles.section}>
        <ThemedText type="smallBold">Route</ThemedText>
        <ThemedText type="small">
          {booking.pickupLocation} → {booking.dropoffLocation}
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
      </ThemedView>

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

import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCar } from '@/hooks/use-cars';
import { useTheme } from '@/hooks/use-theme';
import { bookingFormSchema, type BookingFormValues } from '@/validation/booking';

export default function BookingFormScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { data: car, isLoading } = useCar(carId);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocation: car?.location ?? '',
      dropoffLocation: car?.location ?? '',
      startDate: '',
      endDate: '',
    },
  });

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Loading…</ThemedText>
      </ThemedView>
    );
  }

  if (!car) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText>Car not found.</ThemedText>
      </ThemedView>
    );
  }

  const onSubmit = (values: BookingFormValues) => {
    const days = Math.max(
      1,
      Math.ceil((Date.parse(values.endDate) - Date.parse(values.startDate)) / (24 * 60 * 60 * 1000)),
    );
    const insurance = car.insuranceOptions.find((option) => option.id === values.insuranceOptionId);
    const totalPrice = days * (car.pricePerDay + (insurance?.pricePerDay ?? 0));

    router.push({
      pathname: '/checkout',
      params: {
        draft: JSON.stringify({ carId: car.id, ...values, totalPrice }),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">
        {car.make} {car.model}
      </ThemedText>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Pick-up location</ThemedText>
        <Controller
          control={control}
          name="pickupLocation"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Pick-up location"
            />
          )}
        />
        {errors.pickupLocation && <ThemedText type="small">{errors.pickupLocation.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Drop-off location</ThemedText>
        <Controller
          control={control}
          name="dropoffLocation"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Drop-off location"
            />
          )}
        />
        {errors.dropoffLocation && <ThemedText type="small">{errors.dropoffLocation.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Pick-up date (YYYY-MM-DD)</ThemedText>
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="2026-10-01"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Pick-up date"
            />
          )}
        />
        {errors.startDate && <ThemedText type="small">{errors.startDate.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Return date (YYYY-MM-DD)</ThemedText>
        <Controller
          control={control}
          name="endDate"
          render={({ field }) => (
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="2026-10-05"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              accessibilityLabel="Return date"
            />
          )}
        />
        {errors.endDate && <ThemedText type="small">{errors.endDate.message}</ThemedText>}
      </ThemedView>

      {car.insuranceOptions.length > 0 && (
        <ThemedView style={styles.field}>
          <ThemedText type="smallBold">Insurance</ThemedText>
          <Controller
            control={control}
            name="insuranceOptionId"
            render={({ field }) => (
              <ThemedView style={styles.insuranceOptions}>
                {car.insuranceOptions.map((option) => (
                  <Pressable
                    key={option.id}
                    onPress={() => field.onChange(option.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${option.name} insurance`}
                  >
                    <ThemedView
                      type={field.value === option.id ? 'backgroundSelected' : 'backgroundElement'}
                      style={styles.insuranceChip}
                    >
                      <ThemedText type="small">
                        {option.name} {option.pricePerDay > 0 ? `(+${option.pricePerDay} DKK/day)` : ''}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ThemedView>
            )}
          />
        </ThemedView>
      )}

      <Pressable onPress={handleSubmit(onSubmit)} accessibilityRole="button" accessibilityLabel="Continue to checkout">
        <ThemedView type="backgroundSelected" style={styles.submitButton}>
          <ThemedText type="smallBold">Continue to checkout</ThemedText>
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
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  insuranceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  insuranceChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  submitButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});

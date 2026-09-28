import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ChipGroup } from '@/components/chip-group';
import { DateField } from '@/components/date-field';
import { PriceSummary } from '@/components/price-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { calculatePrice } from '@/domain/pricing';
import { checkAvailability } from '@/hooks/use-bookings';
import { useCar, useInsurance, useLocations } from '@/hooks/use-cars';
import type { BookingDraft } from '@/models/booking';
import type { Car } from '@/models/car';
import type { Insurance } from '@/models/insurance';
import type { Location } from '@/models/location';
import { bookingFormSchema, type BookingFormValues } from '@/validation/booking';

export default function BookingFormScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { data: car, isLoading } = useCar(carId);
  const { data: locations } = useLocations();
  const { data: insuranceOptions } = useInsurance();

  if (isLoading || !locations || !insuranceOptions) {
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

  return <BookingForm car={car} locations={locations} insuranceOptions={insuranceOptions} />;
}

function BookingForm({
  car,
  locations,
  insuranceOptions,
}: {
  car: Car;
  locations: Location[];
  insuranceOptions: Insurance[];
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const locationOptions = locations.map((location) => ({ value: location.id, label: location.name }));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupLocationId: car.locationId,
      dropoffLocationId: car.locationId,
      startDate: '',
      endDate: '',
      insuranceId: insuranceOptions[0]?.id,
    },
  });

  const values = useWatch({ control });
  const preview = bookingFormSchema.safeParse(values);
  const priceFor = (form: BookingFormValues) =>
    calculatePrice({
      car,
      insurance: insuranceOptions.find((option) => option.id === form.insuranceId),
      startDate: form.startDate,
      endDate: form.endDate,
      pickupLocationId: form.pickupLocationId,
      dropoffLocationId: form.dropoffLocationId,
    });

  const onSubmit = async (form: BookingFormValues) => {
    setSubmitError(null);
    if (!(await checkAvailability(car.id, form.startDate, form.endDate))) {
      setSubmitError('This car is already booked for some of those dates. Try other dates.');
      return;
    }
    const draft: BookingDraft = { carId: car.id, ...form, price: priceFor(form) };
    router.push({ pathname: '/checkout', params: { draft: JSON.stringify(draft) } });
  };

  const dateInput = (name: 'startDate' | 'endDate', label: string) => (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <DateField value={field.value} onChange={field.onChange} accessibilityLabel={label} />}
      />
      {errors[name] && <ThemedText type="small">{errors[name]?.message}</ThemedText>}
    </ThemedView>
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ThemedText type="subtitle">
        {car.brand} {car.model}
      </ThemedText>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Pick-up location</ThemedText>
        <Controller
          control={control}
          name="pickupLocationId"
          render={({ field }) => (
            <ChipGroup
              options={locationOptions}
              value={field.value}
              onChange={field.onChange}
              accessibilityLabel="Pick-up location"
            />
          )}
        />
        {errors.pickupLocationId && <ThemedText type="small">{errors.pickupLocationId.message}</ThemedText>}
      </ThemedView>

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Drop-off location</ThemedText>
        <Controller
          control={control}
          name="dropoffLocationId"
          render={({ field }) => (
            <ChipGroup
              options={locationOptions}
              value={field.value}
              onChange={field.onChange}
              accessibilityLabel="Drop-off location"
            />
          )}
        />
        {errors.dropoffLocationId && <ThemedText type="small">{errors.dropoffLocationId.message}</ThemedText>}
      </ThemedView>

      {dateInput('startDate', 'Pick-up date')}
      {dateInput('endDate', 'Return date')}

      <ThemedView style={styles.field}>
        <ThemedText type="smallBold">Insurance</ThemedText>
        <Controller
          control={control}
          name="insuranceId"
          render={({ field }) => (
            <ChipGroup
              options={insuranceOptions.map((option) => ({
                value: option.id,
                label: `${option.name}${option.pricePerDay > 0 ? ` (+${option.pricePerDay} DKK/day)` : ''}`,
              }))}
              value={field.value}
              onChange={field.onChange}
              accessibilityLabel="Insurance"
            />
          )}
        />
      </ThemedView>

      {preview.success && <PriceSummary price={priceFor(preview.data)} />}

      {submitError && <ThemedText type="small">{submitError}</ThemedText>}

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Continue to checkout"
      >
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
  submitButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
});

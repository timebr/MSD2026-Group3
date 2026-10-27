import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, Surface, Text } from 'react-native-paper';

import { ChipGroup } from '@/components/chip-group';
import { DateField } from '@/components/date-field';
import { PriceSummary } from '@/components/price-summary';
import { Spacing } from '@/constants/theme';
import { calculatePrice, formatMoney } from '@/domain/pricing';
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
      <Surface style={styles.center} elevation={0}>
        <ActivityIndicator />
        <Text variant="bodyMedium">Loading…</Text>
      </Surface>
    );
  }

  if (!car) {
    return (
      <Surface style={styles.center} elevation={0}>
        <Text variant="bodyLarge">Car not found.</Text>
      </Surface>
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
    <View style={styles.field}>
      <Text variant="titleSmall" style={styles.bold}>
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <DateField value={field.value} onChange={field.onChange} accessibilityLabel={label} />}
      />
      {errors[name] && (
        <HelperText type="error" padding="none">
          {errors[name]?.message}
        </HelperText>
      )}
    </View>
  );

  return (
    <Surface style={styles.container} elevation={0}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.bold}>
          {car.brand} {car.model}
        </Text>

        <View style={styles.field}>
          <Text variant="titleSmall" style={styles.bold}>
            Pick-up location
          </Text>
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
          {errors.pickupLocationId && (
            <HelperText type="error" padding="none">
              {errors.pickupLocationId.message}
            </HelperText>
          )}
        </View>

        <View style={styles.field}>
          <Text variant="titleSmall" style={styles.bold}>
            Drop-off location
          </Text>
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
          {errors.dropoffLocationId && (
            <HelperText type="error" padding="none">
              {errors.dropoffLocationId.message}
            </HelperText>
          )}
        </View>

        {dateInput('startDate', 'Pick-up date')}
        {dateInput('endDate', 'Return date')}

        <View style={styles.field}>
          <Text variant="titleSmall" style={styles.bold}>
            Insurance
          </Text>
          <Controller
            control={control}
            name="insuranceId"
            render={({ field }) => (
              <ChipGroup
                options={insuranceOptions.map((option) => ({
                  value: option.id,
                  label: `${option.name}${option.pricePerDay > 0 ? ` (+${formatMoney(option.pricePerDay)}/day)` : ''}`,
                }))}
                value={field.value}
                onChange={field.onChange}
                accessibilityLabel="Insurance"
              />
            )}
          />
        </View>

        {preview.success && <PriceSummary price={priceFor(preview.data)} />}

        {submitError && (
          <HelperText type="error" padding="none">
            {submitError}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Continue to checkout"
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
        >
          Continue to checkout
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
    gap: Spacing.two,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  bold: {
    fontWeight: '700',
  },
  submitButton: {
    marginTop: Spacing.two,
  },
  submitButtonContent: {
    paddingVertical: Spacing.one,
  },
});

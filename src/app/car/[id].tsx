import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCar } from '@/hooks/use-cars';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: car, isLoading } = useCar(id);

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

  return (
    <ScrollView>
      <Image source={{ uri: car.imageUrl }} style={styles.image} contentFit="cover" />
      <ThemedView style={styles.content}>
        <ThemedText type="title">
          {car.make} {car.model}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          {car.type} · {car.transmission} · {car.seats} seats · {car.luggageCapacity}
        </ThemedText>
        <ThemedText>{car.description}</ThemedText>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">Fuel policy</ThemedText>
          <ThemedText type="small">{car.fuelPolicy.replace(/-/g, ' ')}</ThemedText>
          {car.isElectric && <ThemedText type="small">Electric vehicle</ThemedText>}
          {car.hasCarPlay && <ThemedText type="small">Apple CarPlay / Android Auto</ThemedText>}
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.section}>
          <ThemedText type="smallBold">Insurance options</ThemedText>
          {car.insuranceOptions.map((option) => (
            <ThemedView key={option.id} style={styles.insuranceRow}>
              <ThemedText type="small">{option.name}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {option.coverageSummary} · {option.deductible} DKK deductible
                {option.pricePerDay > 0 ? ` · +${option.pricePerDay} DKK/day` : ''}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <ThemedText type="subtitle">{car.pricePerDay} DKK / day</ThemedText>

        <Link href={{ pathname: '/booking/[carId]', params: { carId: car.id } }} asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Book this car">
            <ThemedView type="backgroundSelected" style={styles.bookButton}>
              <ThemedText type="smallBold">Book this car</ThemedText>
            </ThemedView>
          </Pressable>
        </Link>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  section: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  insuranceRow: {
    gap: Spacing.half,
    marginTop: Spacing.one,
  },
  bookButton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});

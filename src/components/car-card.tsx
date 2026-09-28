import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Car } from '@/models/car';

export function CarCard({ car }: { car: Car }) {
  return (
    <Link href={{ pathname: '/car/[id]', params: { id: car.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`View details for ${car.brand} ${car.model}`}>
        <ThemedView type="backgroundElement" style={styles.card}>
          <Image source={{ uri: car.imageUrl }} style={styles.image} contentFit="cover" />
          <ThemedView style={styles.info}>
            <ThemedText type="subtitle">
              {car.brand} {car.model}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {car.type} · {car.fuelType} · {car.transmission} · {car.seats} seats
            </ThemedText>
            <ThemedText type="smallBold">{`${car.pricePerDay} DKK / day`}</ThemedText>
          </ThemedView>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: Spacing.three,
    gap: Spacing.half,
  },
});

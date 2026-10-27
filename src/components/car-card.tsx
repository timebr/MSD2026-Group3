import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import { dailyPriceRange, formatDailyRange } from '@/domain/pricing';
import type { Car } from '@/models/car';
import type { Insurance } from '@/models/insurance';

export function CarCard({ car, insuranceOptions }: { car: Car; insuranceOptions: Insurance[] }) {
  const theme = useTheme();

  return (
    <Link href={{ pathname: '/car/[id]', params: { id: car.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`View details for ${car.brand} ${car.model}`}>
        <Card mode="elevated" style={styles.card}>
          <Image source={{ uri: car.imageUrl }} style={styles.image} contentFit="cover" />
          <Card.Content style={styles.info}>
            <Text variant="titleLarge" style={styles.title}>
              {car.brand} {car.model}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {car.type} · {car.fuelType} · {car.transmission} · {car.seats} seats
            </Text>
            <Text variant="titleMedium" style={[styles.price, { color: theme.colors.primary }]}>
              {formatDailyRange(dailyPriceRange(car, insuranceOptions))}
            </Text>
          </Card.Content>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    marginBottom: Spacing.three,
  },
  image: {
    width: '100%',
    height: 170,
    borderTopLeftRadius: Spacing.three,
    borderTopRightRadius: Spacing.three,
  },
  info: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.one,
  },
  title: {
    fontWeight: '700',
  },
  price: {
    fontWeight: '700',
    marginTop: Spacing.half,
  },
});

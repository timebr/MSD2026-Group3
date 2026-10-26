import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Divider, Surface, Text, useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import { dailyPriceRange, formatDailyRange } from '@/domain/pricing';
import { useCar, useInsurance, useLocationName } from '@/hooks/use-cars';

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: car, isLoading } = useCar(id);
  const { data: insuranceOptions = [] } = useInsurance();
  const locationName = useLocationName();
  const theme = useTheme();

  if (isLoading) {
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

  return (
    <Surface style={styles.container} elevation={0}>
      <ScrollView>
        <Image source={{ uri: car.imageUrl }} style={styles.image} contentFit="cover" />
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.bold}>
            {car.brand} {car.model}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {car.type} · {car.fuelType} · {car.transmission} · {car.seats} seats
          </Text>
          <Text variant="bodyLarge">{car.description}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Pick up at {locationName(car.locationId)}
          </Text>

          <Card mode="contained" style={styles.section}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleSmall" style={styles.bold}>
                Fuel policy
              </Text>
              <Text variant="bodyMedium">{car.fuelPolicy.replace(/-/g, ' ')}</Text>
            </Card.Content>
          </Card>

          <Card mode="contained" style={styles.section}>
            <Card.Content style={styles.cardContent}>
              <Text variant="titleSmall" style={styles.bold}>
                Insurance options
              </Text>
              {insuranceOptions.map((option, index) => (
                <View key={option.id} style={styles.insuranceRow}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <Text variant="bodyMedium" style={styles.bold}>
                    {option.name}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {option.coverage} · {option.deductible} DKK deductible
                    {option.pricePerDay > 0 ? ` · +${option.pricePerDay} DKK/day` : ''}
                  </Text>
                </View>
              ))}
            </Card.Content>
          </Card>

          <View style={styles.priceBlock}>
            <Text variant="headlineSmall" style={[styles.bold, { color: theme.colors.primary }]}>
              {formatDailyRange(dailyPriceRange(car, insuranceOptions))}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              From the car alone to the car with full insurance. A one-way fee applies if you return it elsewhere.
            </Text>
          </View>

          <Link href={{ pathname: '/booking/[carId]', params: { carId: car.id } }} asChild>
            <Button
              mode="contained"
              accessibilityRole="button"
              accessibilityLabel="Book this car"
              contentStyle={styles.bookButtonContent}
            >
              Book this car
            </Button>
          </Link>
        </View>
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
  },
  cardContent: {
    gap: Spacing.one,
  },
  insuranceRow: {
    gap: Spacing.half,
    marginTop: Spacing.one,
  },
  divider: {
    marginBottom: Spacing.one,
  },
  priceBlock: {
    gap: Spacing.half,
  },
  bold: {
    fontWeight: '700',
  },
  bookButtonContent: {
    paddingVertical: Spacing.one,
  },
});

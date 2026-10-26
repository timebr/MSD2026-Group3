import { Link, Stack, router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Button, Card, Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarCard } from '@/components/car-card';
import { ChipGroup } from '@/components/chip-group';
import { SyncStatusBanner } from '@/components/sync-status-banner';
import { Spacing } from '@/constants/theme';
import { useCars, useInsurance, useLocations } from '@/hooks/use-cars';
import type { CarSort, CarType } from '@/models/car';

const CAR_TYPES: CarType[] = ['City', 'SUV', 'Estate', 'Van', 'Luxury'];
const TYPE_OPTIONS = CAR_TYPES.map((carType) => ({ value: carType, label: carType }));

export default function CarListScreen() {
  // Set by checkout after a booking is placed.
  const { confirmedBookingId } = useLocalSearchParams<{ confirmedBookingId?: string }>();
  const { data: locations = [] } = useLocations();
  const { data: insuranceOptions = [] } = useInsurance();
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<CarType | undefined>(undefined);
  const [sort, setSort] = useState<CarSort>('price-asc');

  const filters = useMemo(() => ({ locationId, type }), [locationId, type]);
  const { data: cars, isLoading, isError } = useCars(filters, sort);

  return (
    <Surface style={styles.container} elevation={0}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/bookings" asChild>
              <Button mode="text" compact accessibilityRole="button" accessibilityLabel="My bookings">
                My bookings
              </Button>
            </Link>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <SyncStatusBanner />

        {confirmedBookingId && (
          <Card mode="contained" style={styles.confirmedBanner}>
            <Card.Content style={styles.confirmedContent}>
              <Text variant="titleSmall" style={styles.bold}>
                Booking confirmed!
              </Text>
              <View style={styles.confirmedActions}>
                <Link href={{ pathname: '/bookings/[id]', params: { id: confirmedBookingId } }} asChild>
                  <Button mode="text" compact accessibilityRole="button" accessibilityLabel="View booking">
                    View booking
                  </Button>
                </Link>
                <Button
                  mode="text"
                  compact
                  onPress={() => router.setParams({ confirmedBookingId: undefined })}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss confirmation"
                >
                  Dismiss
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        <FlatList
          data={cars}
          keyExtractor={(car) => car.id}
          renderItem={({ item }) => <CarCard car={item} insuranceOptions={insuranceOptions} />}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.filters}>
              <ChipGroup
                options={locations.map((location) => ({ value: location.id, label: location.name }))}
                value={locationId}
                onChange={setLocationId}
                allowDeselect
                accessibilityLabel="Pick-up location"
              />

              <ChipGroup
                options={TYPE_OPTIONS}
                value={type}
                onChange={setType}
                allowDeselect
                accessibilityLabel="Car type"
              />

              <Button
                mode="outlined"
                icon={sort === 'price-desc' ? 'sort-descending' : 'sort-ascending'}
                onPress={() => setSort((current) => (current === 'price-asc' ? 'price-desc' : 'price-asc'))}
                accessibilityRole="button"
                accessibilityLabel="Sort by price"
                style={styles.sortButton}
              >
                Sort: {sort === 'price-desc' ? 'price high to low' : 'price low to high'}
              </Button>

              {isError && (
                <Text variant="bodySmall">Couldn&apos;t load cars. Pull to refresh once you&apos;re back online.</Text>
              )}
            </View>
          }
          ListEmptyComponent={!isLoading ? <Text variant="bodySmall">No cars match those filters.</Text> : null}
        />
      </SafeAreaView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
  },
  confirmedBanner: {
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  confirmedContent: {
    gap: Spacing.one,
  },
  confirmedActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  bold: {
    fontWeight: '700',
  },
  filters: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  sortButton: {
    alignSelf: 'flex-start',
  },
  list: {
    paddingBottom: Spacing.four,
  },
});

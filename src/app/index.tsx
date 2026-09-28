import { Link, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarCard } from '@/components/car-card';
import { ChipGroup } from '@/components/chip-group';
import { SyncStatusBanner } from '@/components/sync-status-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCars, useLocations } from '@/hooks/use-cars';
import type { CarSort, CarType } from '@/models/car';

const CAR_TYPES: CarType[] = ['city', 'suv', 'estate', 'van', 'luxury'];
const TYPE_OPTIONS = CAR_TYPES.map((carType) => ({ value: carType, label: carType }));

export default function CarListScreen() {
  const { data: locations = [] } = useLocations();
  const [locationId, setLocationId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<CarType | undefined>(undefined);
  const [sort, setSort] = useState<CarSort>('price-asc');

  const filters = useMemo(() => ({ locationId, type }), [locationId, type]);
  const { data: cars, isLoading, isError } = useCars(filters, sort);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/bookings" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="My bookings">
                <ThemedText themeColor="text">My bookings</ThemedText>
              </Pressable>
            </Link>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <SyncStatusBanner />

        <ThemedView style={styles.filters}>
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

          <Pressable
            onPress={() => setSort((current) => (current === 'price-asc' ? 'price-desc' : 'price-asc'))}
            accessibilityRole="button"
            accessibilityLabel="Sort by price"
          >
            <ThemedText type="link" themeColor="text">
              Sort: {sort === 'price-desc' ? 'price high to low' : 'price low to high'}
            </ThemedText>
          </Pressable>
        </ThemedView>

        {isError && (
          <ThemedText type="small">Couldn&apos;t load cars. Pull to refresh once you&apos;re back online.</ThemedText>
        )}

        <FlatList
          data={cars}
          keyExtractor={(car) => car.id}
          renderItem={({ item }) => <CarCard car={item} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={!isLoading ? <ThemedText type="small">No cars match those filters.</ThemedText> : null}
        />
      </SafeAreaView>
    </ThemedView>
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
  filters: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  list: {
    paddingBottom: Spacing.four,
  },
});

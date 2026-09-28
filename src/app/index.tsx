import { Link, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CarCard } from '@/components/car-card';
import { SyncStatusBanner } from '@/components/sync-status-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useCars } from '@/hooks/use-cars';
import type { CarSort, CarType } from '@/models/car';
import { useTheme } from '@/hooks/use-theme';

const CAR_TYPES: CarType[] = ['city', 'suv', 'estate', 'van', 'luxury'];

export default function CarListScreen() {
  const theme = useTheme();
  const [location, setLocation] = useState('');
  const [type, setType] = useState<CarType | undefined>(undefined);
  const [sort, setSort] = useState<CarSort | undefined>(undefined);

  const filters = useMemo(() => ({ location: location.trim() || undefined, type }), [location, type]);
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
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Pick-up location"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            accessibilityLabel="Pick-up location"
          />

          <ThemedView style={styles.chipRow}>
            {CAR_TYPES.map((carType) => (
              <Pressable
                key={carType}
                onPress={() => setType((current) => (current === carType ? undefined : carType))}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${carType}`}
              >
                <ThemedView type={type === carType ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
                  <ThemedText type="small">{carType}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>

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
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  list: {
    paddingBottom: Spacing.four,
  },
});

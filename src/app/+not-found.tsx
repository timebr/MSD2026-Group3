import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Surface style={styles.container} elevation={0}>
        <Text variant="headlineMedium">This screen doesn&apos;t exist.</Text>
        <Link href="/" asChild>
          <Button mode="contained">Go to the car list</Button>
        </Link>
      </Surface>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
});

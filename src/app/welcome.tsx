import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

/** S3 entry point on launch: create an account, log in, or browse as a guest. */
export default function WelcomeScreen() {
  const { continueAsGuest } = useAuth();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.content}>
        <ThemedView style={styles.intro}>
          <ThemedText type="title">Rent a car</ThemedText>
          <ThemedText themeColor="textSecondary">
            Browse cars as a guest, or log in to book. You&apos;ll need an account to place a booking.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <Button
            label="Create account"
            variant="primary"
            onPress={() => router.push({ pathname: '/login', params: { mode: 'signup', from: 'welcome' } })}
          />

          <Button
            label="Log in"
            variant="secondary"
            onPress={() => router.push({ pathname: '/login', params: { mode: 'login', from: 'welcome' } })}
          />

          <Pressable
            // No navigation here: the guarded stack in _layout.tsx switches to
            // the car list as soon as the guest choice is stored.
            onPress={continueAsGuest}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
            style={styles.linkButton}
          >
            <ThemedText type="link">Continue as guest</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: 'space-between',
  },
  intro: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  actions: {
    gap: Spacing.two,
  },
  linkButton: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

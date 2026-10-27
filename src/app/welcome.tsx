import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

/** S3 entry point on launch: create an account, log in, or browse as a guest. */
export default function WelcomeScreen() {
  const { continueAsGuest } = useAuth();
  const theme = useTheme();

  return (
    <Surface style={styles.container} elevation={0}>
      <SafeAreaView style={styles.content}>
        <View style={styles.intro}>
          <Text variant="displayMedium" style={styles.title}>
            Carsly - Rent a car
          </Text>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            Browse cars as a guest, or log in to book.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => router.push({ pathname: '/login', params: { mode: 'signup', from: 'welcome' } })}
            accessibilityRole="button"
            accessibilityLabel="Create account"
            contentStyle={styles.buttonContent}
          >
            Create account
          </Button>

          <Button
            mode="outlined"
            onPress={() => router.push({ pathname: '/login', params: { mode: 'login', from: 'welcome' } })}
            accessibilityRole="button"
            accessibilityLabel="Log in"
            contentStyle={styles.buttonContent}
          >
            Log in
          </Button>

          <Button
            mode="text"
            // No navigation here: the guarded stack in _layout.tsx switches to
            // the car list as soon as the guest choice is stored.
            onPress={continueAsGuest}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest"
            contentStyle={styles.buttonContent}
          >
            Continue as guest
          </Button>
        </View>
      </SafeAreaView>
    </Surface>
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
  title: {
    fontWeight: '700',
  },
  actions: {
    gap: Spacing.two,
  },
  buttonContent: {
    paddingVertical: Spacing.one,
  },
});

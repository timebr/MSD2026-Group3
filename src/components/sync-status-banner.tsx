import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useIsOnline } from '@/offline/connectivity';
import { useSyncStatus } from '@/offline/syncManager';

/** Makes booking sync state visible to the user, per NFR3. */
export function SyncStatusBanner() {
  const isOnline = useIsOnline();
  const { pending, failed } = useSyncStatus();

  if (isOnline && pending === 0 && failed === 0) {
    return null;
  }

  const message = !isOnline
    ? "You're offline — changes will sync once you're back online."
    : failed > 0
      ? `${failed} booking update${failed === 1 ? '' : 's'} failed to sync. Will retry automatically.`
      : `Syncing ${pending} booking update${pending === 1 ? '' : 's'}…`;

  return (
    <ThemedView type="backgroundElement" style={styles.banner}>
      <ThemedText type="small">{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});

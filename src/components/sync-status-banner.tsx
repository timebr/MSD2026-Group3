import { Pressable, StyleSheet } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useSyncStatus } from '@/hooks/use-bookings';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';

/** Makes booking sync state visible to the user, per NFR3. */
export function SyncStatusBanner() {
  const isOnline = useIsOnline();
  const { pending, failed } = useSyncStatus();

  if (isOnline && pending === 0 && failed === 0) {
    return null;
  }

  const plural = (n: number) => `${n} booking change${n === 1 ? '' : 's'}`;
  const message = !isOnline
    ? `You're offline. ${pending + failed > 0 ? `${plural(pending + failed)} will sync` : 'Changes will sync'} once you're back online.`
    : failed > 0
      ? `${plural(failed)} failed to sync.`
      : `Syncing ${plural(pending)}…`;

  return (
    <ThemedView type="surface" style={styles.banner}>
      <StatusBadge status={failed > 0 ? 'failed' : 'pending'} />
      <ThemedText type="small" style={styles.message}>
        {message}
      </ThemedText>
      {isOnline && failed > 0 && (
        <Pressable
          onPress={() => requestSync()}
          accessibilityRole="button"
          accessibilityLabel="Retry sync"
          style={styles.retry}
        >
          <ThemedText type="smallBold" themeColor="primary">
            Retry
          </ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  message: {
    flex: 1,
  },
  retry: {
    minHeight: MinTouchSize,
    minWidth: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

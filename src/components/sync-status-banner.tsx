import { StyleSheet } from 'react-native';
import { Button, Surface, Text, useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import { useSyncStatus } from '@/hooks/use-bookings';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';

/** Makes booking sync state visible to the user, per NFR3. */
export function SyncStatusBanner() {
  const theme = useTheme();
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

  const containerColor = failed > 0 ? theme.colors.errorContainer : theme.colors.secondaryContainer;
  const textColor = failed > 0 ? theme.colors.onErrorContainer : theme.colors.onSecondaryContainer;

  return (
    <Surface elevation={1} style={[styles.banner, { backgroundColor: containerColor }]}>
      <Text variant="bodySmall" style={[styles.message, { color: textColor }]}>
        {message}
      </Text>
      {isOnline && failed > 0 && (
        <Button
          mode="text"
          compact
          textColor={textColor}
          onPress={() => requestSync()}
          accessibilityRole="button"
          accessibilityLabel="Retry sync"
        >
          Retry
        </Button>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    marginTop: Spacing.two,
  },
  message: {
    flex: 1,
  },
});

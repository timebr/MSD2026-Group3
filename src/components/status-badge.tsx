import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ThemeColor } from '@/constants/theme';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { SyncState } from '@/models/booking';

const CONFIG: Record<SyncState, { label: string; symbol: SFSymbol; glyph: string; color: ThemeColor }> = {
  pending: { label: 'Pending', symbol: 'clock', glyph: '…', color: 'warning' },
  failed: { label: 'Failed', symbol: 'exclamationmark.triangle.fill', glyph: '!', color: 'error' },
  synced: { label: 'Synced', symbol: 'checkmark.circle.fill', glyph: '✓', color: 'success' },
};

/**
 * Sync state shown as a word plus an icon, never colour alone (teacher
 * feedback, FE#6): an SF Symbol on iOS, a text glyph fallback elsewhere.
 */
export function StatusBadge({ status, label }: { status: SyncState; label?: string }) {
  const theme = useTheme();
  const config = CONFIG[status];
  const color = theme[config.color];

  return (
    <ThemedView style={styles.row}>
      {Platform.OS === 'ios' ? (
        <SymbolView name={config.symbol} size={16} tintColor={color} />
      ) : (
        <ThemedText type="smallBold" themeColor={config.color}>
          {config.glyph}
        </ThemedText>
      )}
      <ThemedText type="small" themeColor={config.color}>
        {label ?? config.label}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
});

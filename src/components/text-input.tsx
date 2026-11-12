import { TextInput as RNTextInput, StyleSheet, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Shared text field: `border` outline, error message in `error` below the field (design doc 5.1). */
export function TextInput({ error, style, ...props }: TextInputProps & { error?: string }) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.wrapper}>
      <RNTextInput
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.border }, style]}
        {...props}
      />
      {error && (
        <ThemedText type="small" themeColor="error">
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  input: {
    minHeight: MinTouchSize,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
});

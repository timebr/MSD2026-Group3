import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

/** Shared button: filled primary, outlined secondary, or error-coloured danger (design doc 5.1). */
export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  accessibilityLabel,
  style,
}: {
  label: string;
  // Optional so this can sit inside `<Link asChild>`, which injects its own
  // onPress for navigation via cloneElement.
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();

  const backgroundColor = variant === 'primary' ? theme.primary : variant === 'danger' ? theme.error : 'transparent';
  const textColor = variant === 'secondary' ? theme.primary : theme.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor: variant === 'secondary' ? theme.border : 'transparent',
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <ThemedText type="smallBold" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MinTouchSize,
    minWidth: MinTouchSize,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

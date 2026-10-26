import { StyleSheet, View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Single-choice row of chips, used instead of free-text input wherever the
 * choices are known (locations, car types, insurance).
 */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  allowDeselect = false,
  accessibilityLabel,
}: {
  options: ChipOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  allowDeselect?: boolean;
  accessibilityLabel: string;
}) {
  const theme = useTheme();

  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Chip
            key={option.value}
            selected={selected}
            showSelectedCheck={false}
            mode={selected ? 'flat' : 'outlined'}
            compact
            selectedColor={selected ? theme.colors.onPrimary : undefined}
            style={
              selected
                ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                : { backgroundColor: theme.colors.surface }
            }
            textStyle={selected ? { color: theme.colors.onPrimary, fontWeight: '700' } : undefined}
            onPress={() => onChange(selected && allowDeselect ? undefined : option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
          >
            {option.label}
          </Chip>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});

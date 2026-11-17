import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MinTouchSize, Spacing } from '@/constants/theme';

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
  return (
    <ThemedView style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(selected && allowDeselect ? undefined : option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={styles.chipTouchArea}
          >
            <ThemedView type={selected ? 'primary' : 'surface'} style={styles.chip}>
              <ThemedText type={selected ? 'smallBold' : 'small'} themeColor={selected ? 'onPrimary' : 'text'}>
                {option.label}
              </ThemedText>
            </ThemedView>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chipTouchArea: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
  },
  chip: {
    minWidth: MinTouchSize,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
    alignItems: 'center',
  },
});

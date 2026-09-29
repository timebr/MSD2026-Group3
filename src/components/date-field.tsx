import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { toDateString } from '@/utils/date';

function fromDateString(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : undefined;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Native date picker on iOS and Android (works in Expo Go). The web build,
 * which the picker doesn't support, falls back to typing YYYY-MM-DD.
 */
export function DateField({
  value,
  onChange,
  accessibilityLabel,
  minimumDate = startOfToday(),
}: {
  value: string;
  onChange: (value: string) => void;
  accessibilityLabel: string;
  minimumDate?: Date;
}) {
  const theme = useTheme();
  const selected = fromDateString(value);

  if (Platform.OS === 'web') {
    return (
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <ThemedView style={styles.iosRow}>
        <DateTimePicker
          value={selected ?? minimumDate}
          mode="date"
          display="compact"
          minimumDate={minimumDate}
          onChange={(_event, date) => date && onChange(toDateString(date))}
          accessibilityLabel={accessibilityLabel}
        />
        {!selected && (
          <ThemedText type="small" themeColor="textSecondary">
            Tap to choose
          </ThemedText>
        )}
      </ThemedView>
    );
  }

  return (
    <Pressable
      onPress={() =>
        DateTimePickerAndroid.open({
          value: selected ?? minimumDate,
          mode: 'date',
          minimumDate,
          onChange: (event, date) => event.type === 'set' && date && onChange(toDateString(date)),
        })
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <ThemedView style={[styles.input, { borderColor: theme.backgroundSelected }]}>
        <ThemedText themeColor={selected ? 'text' : 'textSecondary'}>{selected ? value : 'Choose a date'}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  iosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

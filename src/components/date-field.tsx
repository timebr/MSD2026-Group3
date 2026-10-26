import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
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
        mode="outlined"
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.iosRow}>
        <DateTimePicker
          value={selected ?? minimumDate}
          mode="date"
          display="compact"
          minimumDate={minimumDate}
          onValueChange={(_event, date) => date && onChange(toDateString(date))}
          accessibilityLabel={accessibilityLabel}
        />
        {!selected && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Tap to choose
          </Text>
        )}
      </View>
    );
  }

  return (
    <Button
      mode="outlined"
      icon="calendar"
      onPress={() =>
        DateTimePickerAndroid.open({
          value: selected ?? minimumDate,
          mode: 'date',
          minimumDate,
          // `onValueChange` fires only when the user confirms a date, so the
          // old `event.type === 'set'` guard is no longer needed.
          onValueChange: (_event, date) => date && onChange(toDateString(date)),
        })
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      contentStyle={styles.androidButtonContent}
    >
      {selected ? value : 'Choose a date'}
    </Button>
  );
}

const styles = StyleSheet.create({
  androidButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: Spacing.one,
  },
  iosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});

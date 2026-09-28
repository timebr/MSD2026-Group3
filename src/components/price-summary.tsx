import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { PriceBreakdown } from '@/models/booking';

function Line({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <ThemedView type="backgroundElement" style={styles.line}>
      <ThemedText type={bold ? 'smallBold' : 'small'}>{label}</ThemedText>
      <ThemedText type={bold ? 'smallBold' : 'small'}>{amount} DKK</ThemedText>
    </ThemedView>
  );
}

/** Itemised price so nothing is hidden until the end (FE#2, finding F1). */
export function PriceSummary({ price }: { price: PriceBreakdown }) {
  return (
    <ThemedView type="backgroundElement" style={styles.box}>
      <Line label={`Rental (${price.days} day${price.days === 1 ? '' : 's'})`} amount={price.basePrice} />
      <Line label="Insurance" amount={price.insuranceCost} />
      {price.fees > 0 && <Line label="One-way fee" amount={price.fees} />}
      <ThemedView style={styles.divider} type="backgroundSelected" />
      <Line label="Total" amount={price.totalPrice} bold />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.one,
  },
});

import { StyleSheet, View } from 'react-native';
import { Card, Divider, Text } from 'react-native-paper';

import { Spacing } from '@/constants/theme';
import type { PriceBreakdown } from '@/models/booking';

function Line({ label, amount, bold }: { label: string; amount: number; bold?: boolean }) {
  return (
    <View style={styles.line}>
      <Text variant={bold ? 'titleMedium' : 'bodyMedium'} style={bold ? styles.bold : undefined}>
        {label}
      </Text>
      <Text variant={bold ? 'titleMedium' : 'bodyMedium'} style={bold ? styles.bold : undefined}>
        {amount} DKK
      </Text>
    </View>
  );
}

/** Itemised price so nothing is hidden until the end (FE#2, finding F1). */
export function PriceSummary({ price }: { price: PriceBreakdown }) {
  return (
    <Card mode="contained" style={styles.box}>
      <Card.Content style={styles.content}>
        <Line label={`Rental (${price.days} day${price.days === 1 ? '' : 's'})`} amount={price.basePrice} />
        <Line label="Insurance" amount={price.insuranceCost} />
        {price.fees > 0 && <Line label="One-way fee" amount={price.fees} />}
        <Divider style={styles.divider} />
        <Line label="Total" amount={price.totalPrice} bold />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: Spacing.three,
  },
  content: {
    gap: Spacing.one,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    marginVertical: Spacing.one,
  },
  bold: {
    fontWeight: '700',
  },
});

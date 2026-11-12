import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'heading' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const LINK_TYPES: ThemedTextProps['type'][] = ['link', 'linkPrimary'];

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const isLink = LINK_TYPES.includes(type);

  return (
    <Text
      style={[
        { color: theme[themeColor ?? (isLink ? 'primary' : 'text')] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'heading' && styles.heading,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

// Type scale (design doc 5.1): 32/600 title, 20/600 section heading, 16/400
// body, 14/500 labels. Nothing below 14px, so 200% system font size doesn't
// read as unreadably small text.
const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 600,
    lineHeight: 40,
  },
  heading: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 600,
    lineHeight: 26,
  },
  link: {
    lineHeight: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  linkPrimary: {
    lineHeight: 20,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 14,
  },
});

import { type ViewProps } from 'react-native';
import { Surface } from 'react-native-paper';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: ThemeColor;
};

export function ThemedView({ style, lightColor, darkColor, type, children, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <Surface elevation={0} style={[{ backgroundColor: theme[type ?? 'background'] }, style]} {...otherProps}>
      {children}
    </Surface>
  );
}

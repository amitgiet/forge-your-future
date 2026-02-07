import { StyleProp, ViewStyle } from 'react-native';

/** Merge style objects for React Native (replaces cn() from web). */
export function mergeStyles<T extends ViewStyle>(
  ...styles: (StyleProp<T> | undefined | null)[]
): StyleProp<T> {
  return styles.filter(Boolean).reduce((acc, s) => ({ ...acc, ...(Array.isArray(s) ? Object.assign({}, ...s) : s) }), {}) as StyleProp<T>;
}

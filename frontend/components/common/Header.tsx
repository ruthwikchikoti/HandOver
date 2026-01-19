import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, shadows } from '../../theme/spacing';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  rightTextColor?: string;
  elevated?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  rightText,
  onRightPress,
  rightTextColor,
  elevated = false,
}) => {
  return (
    <View style={[styles.container, elevated && styles.elevated]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.rightContainer}>
        {rightAction}
        {rightText && onRightPress && (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.rightButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.rightText, rightTextColor && { color: rightTextColor }]}>
              {rightText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 60,
  },
  elevated: {
    ...shadows.sm,
    borderBottomWidth: 0,
  },
  leftContainer: {
    minWidth: 70,
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    minWidth: 70,
    alignItems: 'flex-end',
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  backIcon: {
    fontSize: 18,
    color: colors.accent,
    fontWeight: '600',
    marginRight: 4,
  },
  backText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  rightButton: {
    paddingVertical: spacing.xs,
  },
  rightText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
});

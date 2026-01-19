import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface StatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
}) => {
  const getColors = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'approved':
      case 'active':
        return { bg: '#D1FAE5', text: '#065F46' };
      case 'rejected':
      case 'inactive':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: colors.backgroundTertiary, text: colors.textSecondary };
    }
  };

  const statusColors = getColors();

  const getLabel = () => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: statusColors.bg,
          paddingVertical: size === 'small' ? spacing.xs : spacing.sm,
          paddingHorizontal: size === 'small' ? spacing.sm : spacing.md,
        },
      ]}
    >
      <Text
        style={[
          size === 'small' ? typography.caption : typography.bodySmall,
          { color: statusColors.text, fontWeight: '600' },
        ]}
      >
        {getLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { StatusBadge } from './StatusBadge';

interface DependentCardProps {
  name: string;
  email: string;
  permissionCount: number;
  accessGranted: boolean;
  onPress?: () => void;
  onRemove?: () => void;
}

export const DependentCard: React.FC<DependentCardProps> = ({
  name,
  email,
  permissionCount,
  accessGranted,
  onPress,
  onRemove,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.permissions}>
            {permissionCount} {permissionCount === 1 ? 'category' : 'categories'} permitted
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <StatusBadge
          status={accessGranted ? 'active' : 'inactive'}
          size="small"
        />
        {onRemove && (
          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.accent,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  permissions: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  removeButton: {
    padding: spacing.xs,
  },
  removeText: {
    ...typography.bodySmall,
    color: colors.error,
  },
});

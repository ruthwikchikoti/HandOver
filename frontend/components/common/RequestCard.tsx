import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

interface RequestCardProps {
  ownerName?: string;
  ownerEmail?: string;
  dependentName?: string;
  dependentEmail?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  adminNote?: string;
  onApprove?: () => void;
  onReject?: () => void;
  onPress?: () => void;
  showActions?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  ownerName,
  ownerEmail,
  dependentName,
  dependentEmail,
  reason,
  status,
  createdAt,
  adminNote,
  onApprove,
  onReject,
  onPress,
  showActions = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <StatusBadge status={status} size="small" />
        <Text style={styles.date}>{formatDate(createdAt)}</Text>
      </View>

      {ownerName && (
        <View style={styles.person}>
          <Text style={styles.personLabel}>Owner:</Text>
          <Text style={styles.personName}>{ownerName}</Text>
          <Text style={styles.personEmail}>{ownerEmail}</Text>
        </View>
      )}

      {dependentName && (
        <View style={styles.person}>
          <Text style={styles.personLabel}>Dependent:</Text>
          <Text style={styles.personName}>{dependentName}</Text>
          <Text style={styles.personEmail}>{dependentEmail}</Text>
        </View>
      )}

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Reason:</Text>
        <Text style={styles.reason}>{reason}</Text>
      </View>

      {adminNote && status !== 'pending' && (
        <View style={styles.noteContainer}>
          <Text style={styles.noteLabel}>Admin Note:</Text>
          <Text style={styles.note}>{adminNote}</Text>
        </View>
      )}

      {showActions && status === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Reject"
            onPress={onReject!}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
          <Button
            title="Approve"
            onPress={onApprove!}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  person: {
    marginBottom: spacing.sm,
  },
  personLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  personName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  personEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reasonContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  reason: {
    ...typography.body,
    color: colors.textPrimary,
  },
  noteContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
  },
  noteLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  note: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  actionButton: {
    minWidth: 100,
  },
});

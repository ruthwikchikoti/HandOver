import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface PermissionToggleProps {
  category: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
}

const categoryLabels: Record<string, string> = {
  assets: 'Assets',
  liabilities: 'Liabilities',
  insurance: 'Insurance',
  contacts: 'Contacts',
  emergency: 'Emergency',
  notes: 'Notes',
};

const categoryDescriptions: Record<string, string> = {
  assets: 'Bank accounts, investments, properties',
  liabilities: 'Loans, debts, mortgages',
  insurance: 'Life, health, auto policies',
  contacts: 'Important people to reach',
  emergency: 'Urgent instructions',
  notes: 'General notes and information',
};

export const PermissionToggle: React.FC<PermissionToggleProps> = ({
  category,
  enabled,
  onToggle,
  disabled = false,
}) => {
  const color = categoryColors[category] || colors.textTertiary;

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={[styles.indicator, { backgroundColor: color }]} />
      <View style={styles.content}>
        <Text style={styles.label}>{categoryLabels[category]}</Text>
        <Text style={styles.description}>{categoryDescriptions[category]}</Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.accent + '50' }}
        thumbColor={enabled ? colors.accent : colors.backgroundTertiary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabled: {
    opacity: 0.5,
  },
  indicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  description: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
});

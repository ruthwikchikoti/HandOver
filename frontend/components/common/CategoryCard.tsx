import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface CategoryCardProps {
  category: 'assets' | 'liabilities' | 'insurance' | 'contacts' | 'emergency' | 'notes';
  count: number;
  onPress: () => void;
}

const categoryIcons: Record<string, string> = {
  assets: '$',
  liabilities: '-',
  insurance: '+',
  contacts: '@',
  emergency: '!',
  notes: '#',
};

const categoryLabels: Record<string, string> = {
  assets: 'Assets',
  liabilities: 'Liabilities',
  insurance: 'Insurance',
  contacts: 'Contacts',
  emergency: 'Emergency',
  notes: 'Notes',
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  count,
  onPress,
}) => {
  const color = categoryColors[category];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={[styles.icon, { color }]}>{categoryIcons[category]}</Text>
      </View>
      <Text style={styles.label}>{categoryLabels[category]}</Text>
      <Text style={styles.count}>{count} {count === 1 ? 'entry' : 'entries'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});

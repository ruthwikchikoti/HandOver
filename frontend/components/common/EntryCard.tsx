import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface EntryCardProps {
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  onPress?: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  title,
  content,
  category,
  updatedAt,
  onPress,
}) => {
  const color = categoryColors[category] || colors.textTertiary;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateContent = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={[styles.categoryDot, { backgroundColor: color }]} />
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Text style={styles.content} numberOfLines={2}>
        {truncateContent(content)}
      </Text>
      <Text style={styles.date}>{formatDate(updatedAt)}</Text>
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
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

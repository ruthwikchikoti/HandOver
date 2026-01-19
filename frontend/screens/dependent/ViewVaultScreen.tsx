import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccess } from '../../context/AccessContext';
import { KnowledgeEntry } from '../../context/VaultContext';
import { Permissions } from '../../context/DependentContext';
import { EntryCard, LoadingSpinner, EmptyState, Card, StatusBadge } from '../../components/common';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const categoryLabels: Record<string, string> = {
  assets: 'Assets',
  liabilities: 'Liabilities',
  insurance: 'Insurance',
  contacts: 'Contacts',
  emergency: 'Emergency',
  notes: 'Notes',
};

export const ViewVaultScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { viewOwnerVault } = useAccess();

  const { ownerId, ownerName } = route.params;

  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadVault = async () => {
    try {
      const data = await viewOwnerVault(ownerId);
      setEntries(data.entries);
      setPermissions(data.permissions);
      setError('');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to load vault';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVault();
  }, [ownerId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVault();
    setRefreshing(false);
  };

  const permittedCategories = permissions
    ? (Object.keys(permissions) as Array<keyof Permissions>).filter(
        (cat) => permissions[cat]
      )
    : [];

  const filteredEntries = selectedCategory
    ? entries.filter((e) => e.category === selectedCategory)
    : entries;

  const entriesByCategory = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push(entry);
    return acc;
  }, {} as Record<string, KnowledgeEntry[]>);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading vault..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{ownerName}'s Vault</Text>
          <View style={{ width: 60 }} />
        </View>
        <EmptyState
          title="Access Denied"
          message={error}
          icon="X"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{ownerName}'s Vault</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.readOnlyBanner}>
        <Text style={styles.readOnlyText}>Read-Only Access</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Permitted Categories</Text>
          <View style={styles.categoryChips}>
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive,
                ]}
              >
                All ({entries.length})
              </Text>
            </TouchableOpacity>
            {permittedCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                  {
                    borderColor:
                      selectedCategory === cat
                        ? categoryColors[cat]
                        : colors.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColors[cat] },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat && styles.categoryChipTextActive,
                  ]}
                >
                  {categoryLabels[cat]} ({entriesByCategory[cat]?.length || 0})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {filteredEntries.length === 0 ? (
          <EmptyState
            title="No entries"
            message={
              selectedCategory
                ? `No entries in ${categoryLabels[selectedCategory]}`
                : 'This vault has no entries in permitted categories'
            }
            icon="#"
          />
        ) : (
          <View style={styles.entriesList}>
            {filteredEntries.map((entry) => (
              <Card key={entry._id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View
                    style={[
                      styles.entryDot,
                      { backgroundColor: categoryColors[entry.category] },
                    ]}
                  />
                  <Text style={styles.entryTitle}>{entry.title}</Text>
                </View>
                <Text style={styles.entryCategory}>
                  {categoryLabels[entry.category]}
                </Text>
                <Text style={styles.entryContent}>{entry.content}</Text>
                <Text style={styles.entryDate}>
                  Last updated:{' '}
                  {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  readOnlyBanner: {
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    alignItems: 'center',
  },
  readOnlyText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  categoriesSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  categoryChipActive: {
    backgroundColor: colors.backgroundTertiary,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  entriesList: {},
  entryCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  entryTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  entryCategory: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  entryContent: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  entryDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

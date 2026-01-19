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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useVault } from '../../context/VaultContext';
import {
  CategoryCard,
  EntryCard,
  LoadingSpinner,
  EmptyState,
  Button,
} from '../../components/common';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

type ViewMode = 'categories' | 'all';
const TAB_BAR_HEIGHT = 70;

export const VaultScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { entries, stats, fetchEntries, fetchStats, loading } = useVault();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const loadData = async () => {
    try {
      await Promise.all([fetchEntries(), fetchStats()]);
    } catch (error) {
      console.error('Error loading vault data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
    setViewMode('all');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setViewMode('categories');
  };

  const filteredEntries = selectedCategory
    ? entries.filter((e) => e.category === selectedCategory)
    : entries;

  const categories: Array<'assets' | 'liabilities' | 'insurance' | 'contacts' | 'emergency' | 'notes'> = [
    'assets',
    'liabilities',
    'insurance',
    'contacts',
    'emergency',
    'notes',
  ];

  if (loading && entries.length === 0) {
    return <LoadingSpinner fullScreen message="Loading vault..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {selectedCategory && (
            <TouchableOpacity onPress={handleBackToCategories}>
              <Text style={styles.backButton}>{'<'} Back</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>
          {selectedCategory
            ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
            : 'Vault'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddEntry', { category: selectedCategory })
          }
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {viewMode === 'categories' && !selectedCategory ? (
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <CategoryCard
                key={category}
                category={category}
                count={stats[category]}
                onPress={() => handleCategoryPress(category)}
              />
            ))}
          </View>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            title="No entries yet"
            message={
              selectedCategory
                ? `Add your first ${selectedCategory} entry`
                : 'Start by adding your first vault entry'
            }
            actionLabel="Add Entry"
            onAction={() =>
              navigation.navigate('AddEntry', { category: selectedCategory })
            }
            icon="+"
          />
        ) : (
          <View style={styles.entriesList}>
            {filteredEntries.map((entry) => (
              <EntryCard
                key={entry._id}
                title={entry.title}
                content={entry.content}
                category={entry.category}
                updatedAt={entry.updatedAt}
                onPress={() =>
                  navigation.navigate('EditEntry', { entryId: entry._id })
                }
              />
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
  headerLeft: {
    width: 60,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 28,
  },
  scrollContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entriesList: {},
});

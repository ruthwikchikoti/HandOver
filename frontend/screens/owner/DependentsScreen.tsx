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
import { showAlert } from '../../utils/alert';
import { useNavigation } from '@react-navigation/native';
import { useDependents, Permissions } from '../../context/DependentContext';
import {
  DependentCard,
  LoadingSpinner,
  EmptyState,
  Card,
  PermissionToggle,
} from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const DependentsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { dependents, fetchDependents, updateDependentPermissions, removeDependent, loading } = useDependents();
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDependents();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDependents();
    setRefreshing(false);
  };

  const handleRemove = (id: string, name: string) => {
    showAlert(
      'Remove Dependent',
      `Are you sure you want to remove ${name}?`,
      async () => {
        try {
          await removeDependent(id);
        } catch (error) {
          showAlert('Error', 'Failed to remove dependent');
        }
      }
    );
  };

  const handleTogglePermission = async (
    dependentId: string,
    category: keyof Permissions,
    currentPermissions: Permissions
  ) => {
    try {
      const newPermissions = {
        ...currentPermissions,
        [category]: !currentPermissions[category],
      };
      await updateDependentPermissions(dependentId, newPermissions);
    } catch (error) {
      showAlert('Error', 'Failed to update permissions');
    }
  };

  const countPermissions = (permissions: Permissions): number => {
    return Object.values(permissions).filter(Boolean).length;
  };

  if (loading && dependents.length === 0) {
    return <LoadingSpinner fullScreen message="Loading dependents..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dependents</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddDependent')}
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
        {dependents.length === 0 ? (
          <EmptyState
            title="No dependents yet"
            message="Add people who should have access to your vault when needed"
            actionLabel="Add Dependent"
            onAction={() => navigation.navigate('AddDependent')}
            icon="@"
          />
        ) : (
          dependents.map((dep) => (
            <View key={dep._id}>
              <DependentCard
                name={dep.dependentId.name}
                email={dep.dependentId.email}
                permissionCount={countPermissions(dep.permissions)}
                accessGranted={dep.accessGranted}
                onPress={() =>
                  setExpandedId(expandedId === dep._id ? null : dep._id)
                }
                onRemove={() => handleRemove(dep._id, dep.dependentId.name)}
              />
              {expandedId === dep._id && (
                <Card style={styles.permissionsCard}>
                  <Text style={styles.permissionsTitle}>Category Permissions</Text>
                  {(Object.keys(dep.permissions) as Array<keyof Permissions>).map(
                    (category) => (
                      <PermissionToggle
                        key={category}
                        category={category}
                        enabled={dep.permissions[category]}
                        onToggle={() =>
                          handleTogglePermission(dep._id, category, dep.permissions)
                        }
                      />
                    )
                  )}
                </Card>
              )}
            </View>
          ))
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
  permissionsCard: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  permissionsTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
});

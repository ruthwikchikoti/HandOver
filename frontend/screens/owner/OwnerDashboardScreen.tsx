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
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import { useDependents } from '../../context/DependentContext';
import { authAPI } from '../../utils/api';
import { Card, LoadingSpinner, StatusBadge } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const OwnerDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, updateUser, logout } = useAuth();
  const { stats, fetchStats } = useVault();
  const { dependents, fetchDependents } = useDependents();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const userResponse = await authAPI.getMe();
      updateUser(userResponse.data);
      await Promise.all([fetchStats(), fetchDependents()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
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

  const totalEntries = Object.values(stats).reduce((a, b) => a + b, 0);

  const formatLastActivity = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, string> = {
      assets: colors.categoryAssets,
      liabilities: colors.categoryLiabilities,
      insurance: colors.categoryInsurance,
      contacts: colors.categoryContacts,
      emergency: colors.categoryEmergency,
      notes: colors.categoryNotes,
    };
    return categoryColors[category] || colors.textTertiary;
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0).toUpperCase() || 'O'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Hello, {user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>OWNER</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Welcome to your secure vault</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.accent + '15' }]}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{totalEntries}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.categoryContacts + '20' }]}>
            <Text style={[styles.statNumber, { color: colors.categoryContacts }]}>{dependents.length}</Text>
            <Text style={styles.statLabel}>Dependents</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: user?.isInactive ? colors.warning + '15' : colors.success + '15' }]}>
            <Text style={[styles.statNumber, { color: user?.isInactive ? colors.warning : colors.success }]}>
              {user?.isInactive ? '!' : '✓'}
            </Text>
            <Text style={styles.statLabel}>{user?.isInactive ? 'Inactive' : 'Active'}</Text>
          </View>
        </View>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.sectionTitle}>Account Status</Text>
            <StatusBadge status={user?.isInactive ? 'inactive' : 'active'} size="small" />
          </View>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Last Activity</Text>
              <Text style={styles.statusValue}>{formatLastActivity(user?.lastActivityAt)}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Inactivity Trigger</Text>
              <Text style={styles.statusValue}>{user?.inactivityDays} days</Text>
            </View>
          </View>
        </Card>

        {/* Vault Overview */}
        <Card style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Vault Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Vault')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {Object.entries(stats).map(([category, count]) => (
              <View key={category} style={styles.categoryItem}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.categoryName}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <Text style={styles.categoryCount}>{count}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Dependents Preview */}
        <Card style={styles.dependentsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Your Dependents</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Dependents')}>
              <Text style={styles.viewAllText}>Manage →</Text>
            </TouchableOpacity>
          </View>
          {dependents.length === 0 ? (
            <View style={styles.emptyDependents}>
              <Text style={styles.emptyText}>No dependents added yet</Text>
              <TouchableOpacity
                style={styles.addDependentBtn}
                onPress={() => navigation.navigate('AddDependent')}
              >
                <Text style={styles.addDependentText}>+ Add Dependent</Text>
              </TouchableOpacity>
            </View>
          ) : (
            dependents.slice(0, 3).map((dep) => (
              <View key={dep._id} style={styles.dependentRow}>
                <View style={styles.dependentAvatar}>
                  <Text style={styles.dependentInitial}>
                    {dep.dependentId.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.dependentInfo}>
                  <Text style={styles.dependentName}>{dep.dependentId.name}</Text>
                  <Text style={styles.dependentEmail}>{dep.dependentId.email}</Text>
                </View>
                <View style={[
                  styles.accessBadge,
                  dep.accessGranted ? styles.accessGranted : styles.accessPending
                ]}>
                  <Text style={[
                    styles.accessBadgeText,
                    dep.accessGranted ? { color: colors.success } : { color: colors.textTertiary }
                  ]}>
                    {dep.accessGranted ? 'ACCESS' : 'PENDING'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AddEntry', {})}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + '15' }]}>
              <Text style={[styles.actionIconText, { color: colors.accent }]}>+</Text>
            </View>
            <Text style={styles.actionTitle}>Add Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AuditLog')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.actionIconText, { color: colors.primary }]}>≡</Text>
            </View>
            <Text style={styles.actionTitle}>Audit Log</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInitial: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  profileInfo: {
    justifyContent: 'center',
  },
  greeting: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  roleBadge: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 10,
  },
  logoutButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.md,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statusGrid: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  statusValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  overviewCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  categoryGrid: {
    gap: spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  categoryCount: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dependentsCard: {
    marginBottom: spacing.md,
  },
  emptyDependents: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  addDependentBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.md,
  },
  addDependentText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  dependentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dependentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  dependentInitial: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dependentEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  accessBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  accessGranted: {
    backgroundColor: colors.success + '15',
  },
  accessPending: {
    backgroundColor: colors.backgroundTertiary,
  },
  accessBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionIconText: {
    fontSize: 24,
    fontWeight: '600',
  },
  actionTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});

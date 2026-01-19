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
import { usersAPI } from '../../utils/api';
import { Card, LoadingSpinner, EmptyState, StatusBadge } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'dependent' | 'admin';
  isInactive?: boolean;
  lastActivityAt?: string;
  createdAt: string;
}

export const AllUsersScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'owner' | 'dependent'>('all');

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return user.role !== 'admin';
    return user.role === filter;
  });

  const owners = users.filter((u) => u.role === 'owner');
  const dependents = users.filter((u) => u.role === 'dependent');
  const inactiveOwners = owners.filter((u) => u.isInactive);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>All Users</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.subtitle}>Manage and monitor platform users</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.miniStat, { backgroundColor: colors.accent + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.accent }]}>{owners.length + dependents.length}</Text>
          <Text style={styles.miniStatLabel}>Total</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.primary }]}>{owners.length}</Text>
          <Text style={styles.miniStatLabel}>Owners</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.categoryContacts + '20' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.categoryContacts }]}>{dependents.length}</Text>
          <Text style={styles.miniStatLabel}>Dependents</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, filter === 'all' && styles.tabActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>
            All ({owners.length + dependents.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'owner' && styles.tabActive]}
          onPress={() => setFilter('owner')}
        >
          <Text style={[styles.tabText, filter === 'owner' && styles.tabTextActive]}>
            Owners ({owners.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === 'dependent' && styles.tabActive]}
          onPress={() => setFilter('dependent')}
        >
          <Text style={[styles.tabText, filter === 'dependent' && styles.tabTextActive]}>
            Dependents ({dependents.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredUsers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>@</Text>
            </View>
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptyMessage}>
              No users match the selected filter.
            </Text>
          </Card>
        ) : (
          filteredUsers.map((user) => {
            const isOwner = user.role === 'owner';
            const isInactive = user.isInactive;

            return (
              <Card
                key={user._id}
                style={[
                  styles.userCard,
                  isInactive && styles.inactiveCard,
                ]}
              >
                <View style={styles.userHeader}>
                  <View style={[
                    styles.userAvatar,
                    isOwner
                      ? { backgroundColor: colors.primary + '20' }
                      : { backgroundColor: colors.accent + '20' },
                    isInactive && { backgroundColor: colors.warning + '20' },
                  ]}>
                    <Text style={[
                      styles.userInitial,
                      isOwner ? { color: colors.primary } : { color: colors.accent },
                      isInactive && { color: colors.warning },
                    ]}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{user.name}</Text>
                      {isInactive && (
                        <View style={styles.inactiveBadge}>
                          <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                  <View style={[
                    styles.roleBadge,
                    isOwner
                      ? { backgroundColor: colors.primary + '15' }
                      : { backgroundColor: colors.accent + '15' },
                  ]}>
                    <Text style={[
                      styles.roleText,
                      isOwner ? { color: colors.primary } : { color: colors.accent },
                    ]}>
                      {isOwner ? 'OWNER' : 'DEPENDENT'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  {isOwner && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View style={[
                        styles.statusDot,
                        isInactive
                          ? { backgroundColor: colors.warning }
                          : { backgroundColor: colors.success },
                      ]} />
                      <Text style={[
                        styles.detailValue,
                        isInactive ? { color: colors.warning } : { color: colors.success },
                      ]}>
                        {isInactive ? 'Inactive' : 'Active'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last Active</Text>
                    <Text style={styles.detailValue}>
                      {user.lastActivityAt ? getTimeAgo(user.lastActivityAt) : 'Never'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Joined</Text>
                    <Text style={styles.detailValue}>{formatDate(user.createdAt)}</Text>
                  </View>
                </View>
              </Card>
            );
          })
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
  headerContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  backButton: {
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    ...typography.body,
    color: colors.accent,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  miniStatNumber: {
    ...typography.h3,
    fontWeight: '700',
  },
  miniStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.textTertiary,
    fontWeight: '700',
  },
  emptyTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  userCard: {
    marginBottom: spacing.md,
  },
  inactiveCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInitial: {
    ...typography.h3,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  inactiveBadge: {
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  inactiveBadgeText: {
    fontSize: 9,
    color: colors.warning,
    fontWeight: '700',
  },
  userEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginRight: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  detailValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

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
import { useAccess } from '../../context/AccessContext';
import { usersAPI } from '../../utils/api';
import { Card, LoadingSpinner } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

interface UserStats {
  total: number;
  owners: number;
  dependents: number;
  inactiveOwners: number;
}

export const AdminDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { pendingRequests, fetchPendingRequests } = useAccess();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await fetchPendingRequests();
      const statsResponse = await usersAPI.getStats();
      setUserStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading admin data:', error);
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
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Hello, {user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>ADMIN</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>Manage platform users and requests</Text>
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
            <Text style={[styles.statNumber, { color: colors.accent }]}>{userStats?.total || 0}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{pendingRequests.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.categoryEmergency + '15' }]}>
            <Text style={[styles.statNumber, { color: colors.categoryEmergency }]}>{userStats?.inactiveOwners || 0}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {/* Alert Card */}
        {pendingRequests.length > 0 && (
          <TouchableOpacity
            style={styles.alertCard}
            onPress={() => navigation.navigate('PendingRequests')}
            activeOpacity={0.8}
          >
            <View style={styles.alertIcon}>
              <Text style={styles.alertIconText}>{pendingRequests.length}</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Pending Requests</Text>
              <Text style={styles.alertSubtitle}>Access requests need your review</Text>
            </View>
            <Text style={styles.alertArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('PendingRequests')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.warning + '15' }]}>
                <Text style={[styles.actionIconText, { color: colors.warning }]}>V</Text>
              </View>
              <Text style={styles.actionLabel}>Requests</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => navigation.navigate('AllUsers')}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.accent + '15' }]}>
                <Text style={[styles.actionIconText, { color: colors.accent }]}>@</Text>
              </View>
              <Text style={styles.actionLabel}>Users</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* User Stats */}
        <Card style={styles.userStatsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>User Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllUsers')}>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.userStatRow}>
            <View style={[styles.userStatDot, { backgroundColor: colors.primary }]} />
            <Text style={styles.userStatLabel}>Owners</Text>
            <Text style={styles.userStatValue}>{userStats?.owners || 0}</Text>
          </View>
          <View style={styles.userStatRow}>
            <View style={[styles.userStatDot, { backgroundColor: colors.accent }]} />
            <Text style={styles.userStatLabel}>Dependents</Text>
            <Text style={styles.userStatValue}>{userStats?.dependents || 0}</Text>
          </View>
          <View style={styles.userStatRow}>
            <View style={[styles.userStatDot, { backgroundColor: colors.warning }]} />
            <Text style={styles.userStatLabel}>Inactive Owners</Text>
            <Text style={styles.userStatValue}>{userStats?.inactiveOwners || 0}</Text>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Your Responsibilities</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>1</Text>
            </View>
            <Text style={styles.infoText}>Review and process access requests from dependents</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>2</Text>
            </View>
            <Text style={styles.infoText}>Verify the legitimacy of each request before approval</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoBullet}>
              <Text style={styles.infoBulletText}>3</Text>
            </View>
            <Text style={styles.infoText}>Monitor system activity and user behavior</Text>
          </View>
        </Card>
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
  alertCard: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white + '30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertIconText: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '700',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
  },
  alertSubtitle: {
    ...typography.caption,
    color: colors.white + 'CC',
    marginTop: 2,
  },
  alertArrow: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
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
    fontSize: 20,
    fontWeight: '600',
  },
  actionLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  userStatsCard: {
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
  userStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userStatDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  userStatLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  userStatValue: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: colors.accent + '08',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  infoBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  infoBulletText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});

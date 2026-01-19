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
import { useAuth } from '../../context/AuthContext';
import { useDependents, DependentRelation } from '../../context/DependentContext';
import { Card, LoadingSpinner, StatusBadge, Button } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const DependentDashboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { owners, fetchOwners, loading } = useDependents();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOwners();
    setRefreshing(false);
  };

  const getOwnerData = (relation: DependentRelation) => {
    const owner = relation.ownerId as {
      _id: string;
      name: string;
      email: string;
      isInactive?: boolean;
      lastActivityAt?: string;
    };
    // Handle case where ownerId might not be populated
    if (typeof relation.ownerId === 'string') {
      return { _id: relation.ownerId, name: 'Unknown', email: '', isInactive: false };
    }
    return owner;
  };

  const countPermissions = (permissions: Record<string, boolean>): number => {
    return Object.values(permissions).filter(Boolean).length;
  };

  const handleOwnerPress = (relation: DependentRelation) => {
    const owner = getOwnerData(relation);

    if (relation.accessGranted) {
      navigation.navigate('ViewVault', {
        ownerId: owner._id,
        ownerName: owner.name,
      });
    } else if (owner.isInactive) {
      navigation.navigate('RequestAccess', {
        ownerId: owner._id,
        ownerName: owner.name,
      });
    } else {
      showAlert(
        'Access Not Available',
        `${owner.name} is currently active. You can request access when they become inactive.`
      );
    }
  };

  if (loading && owners.length === 0) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  const activeOwners = owners.filter(r => !getOwnerData(r).isInactive);
  const inactiveOwners = owners.filter(r => getOwnerData(r).isInactive);
  const accessibleVaults = owners.filter(r => r.accessGranted);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>Hello, {user?.name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>DEPENDENT</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>View vaults shared with you</Text>
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
            <Text style={[styles.statNumber, { color: colors.accent }]}>{owners.length}</Text>
            <Text style={styles.statLabel}>Owners</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{accessibleVaults.length}</Text>
            <Text style={styles.statLabel}>Accessible</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
            <Text style={[styles.statNumber, { color: colors.warning }]}>{inactiveOwners.length}</Text>
            <Text style={styles.statLabel}>Inactive</Text>
          </View>
        </View>

        {owners.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>@</Text>
            </View>
            <Text style={styles.emptyTitle}>No Owners Yet</Text>
            <Text style={styles.emptyMessage}>
              You haven't been added as a dependent by any owner yet. Ask an owner to add you using your email address.
            </Text>
          </Card>
        ) : (
          <View>
            {/* Linked Owners */}
            <Card style={styles.ownersCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Linked Owners</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{owners.length}</Text>
                </View>
              </View>

              {owners.map((relation) => {
                const owner = getOwnerData(relation);
                const permCount = countPermissions(relation.permissions);
                const isAccessible = relation.accessGranted;
                const canRequest = owner.isInactive && !isAccessible;

                return (
                  <TouchableOpacity
                    key={relation._id}
                    style={styles.ownerRow}
                    onPress={() => handleOwnerPress(relation)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.ownerAvatar,
                      isAccessible && { backgroundColor: colors.success + '20' },
                      canRequest && { backgroundColor: colors.warning + '20' },
                    ]}>
                      <Text style={[
                        styles.ownerInitial,
                        isAccessible && { color: colors.success },
                        canRequest && { color: colors.warning },
                      ]}>
                        {owner.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.ownerInfo}>
                      <Text style={styles.ownerName}>{owner.name}</Text>
                      <Text style={styles.ownerMeta}>
                        {permCount} categories • {owner.isInactive ? 'Inactive' : 'Active'}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      isAccessible && { backgroundColor: colors.success + '15' },
                      canRequest && { backgroundColor: colors.warning + '15' },
                      !isAccessible && !canRequest && { backgroundColor: colors.backgroundTertiary },
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        isAccessible && { color: colors.success },
                        canRequest && { color: colors.warning },
                        !isAccessible && !canRequest && { color: colors.textTertiary },
                      ]}>
                        {isAccessible ? 'VIEW' : canRequest ? 'REQUEST' : 'WAITING'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Card>

            {/* Info Card */}
            <Card style={styles.infoCard}>
              <Text style={styles.sectionTitle}>How it works</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>1</Text>
                </View>
                <Text style={styles.infoText}>Owners add you as a dependent with specific permissions</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>2</Text>
                </View>
                <Text style={styles.infoText}>When an owner becomes inactive, you can request access</Text>
              </View>
              <View style={styles.infoRow}>
                <View style={styles.infoBullet}>
                  <Text style={styles.infoBulletText}>3</Text>
                </View>
                <Text style={styles.infoText}>Once approved by admin, you can view their vault</Text>
              </View>
            </Card>
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
    lineHeight: 22,
  },
  ownersCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
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
  countBadge: {
    backgroundColor: colors.accent + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countBadgeText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '700',
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  ownerInitial: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ownerMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
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

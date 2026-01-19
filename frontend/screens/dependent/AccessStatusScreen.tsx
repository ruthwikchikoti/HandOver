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
import { useAuth } from '../../context/AuthContext';
import { useAccess, AccessRequest } from '../../context/AccessContext';
import { RequestCard, LoadingSpinner, EmptyState, Card } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const AccessStatusScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { myRequests, fetchMyRequests, loading } = useAccess();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyRequests();
    setRefreshing(false);
  };

  const getOwnerData = (request: AccessRequest) => {
    const owner = request.ownerId as {
      _id: string;
      name: string;
      email: string;
    };
    // Handle case where ownerId might not be populated
    if (typeof request.ownerId === 'string') {
      return { _id: request.ownerId, name: 'Unknown', email: '' };
    }
    return owner;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const pendingRequests = myRequests.filter((r) => r.status === 'pending');
  const approvedRequests = myRequests.filter((r) => r.status === 'approved');
  const rejectedRequests = myRequests.filter((r) => r.status === 'rejected');
  const processedRequests = myRequests.filter((r) => r.status !== 'pending');

  if (loading && myRequests.length === 0) {
    return <LoadingSpinner fullScreen message="Loading requests..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Access Status</Text>
        <Text style={styles.subtitle}>Track your vault access requests</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.miniStat, { backgroundColor: colors.warning + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.warning }]}>{pendingRequests.length}</Text>
          <Text style={styles.miniStatLabel}>Pending</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.success + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.success }]}>{approvedRequests.length}</Text>
          <Text style={styles.miniStatLabel}>Approved</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.error + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.error }]}>{rejectedRequests.length}</Text>
          <Text style={styles.miniStatLabel}>Rejected</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({processedRequests.length})
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
        {myRequests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>?</Text>
            </View>
            <Text style={styles.emptyTitle}>No Requests Yet</Text>
            <Text style={styles.emptyMessage}>
              You haven't made any access requests. When an owner becomes inactive, you can request access to their vault.
            </Text>
          </Card>
        ) : (
          <>
            {activeTab === 'pending' ? (
              pendingRequests.length > 0 ? (
                <View>
                  <Card style={styles.infoCard}>
                    <View style={styles.infoIconContainer}>
                      <Text style={styles.infoIcon}>i</Text>
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoTitle}>Under Review</Text>
                      <Text style={styles.infoText}>
                        Your requests are being reviewed by an administrator. You'll get access once approved.
                      </Text>
                    </View>
                  </Card>
                  {pendingRequests.map((request) => {
                    const owner = getOwnerData(request);
                    return (
                      <Card key={request._id} style={styles.requestCard}>
                        <View style={styles.requestHeader}>
                          <View style={styles.ownerAvatar}>
                            <Text style={styles.ownerInitial}>{owner.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={styles.requestInfo}>
                            <Text style={styles.ownerName}>{owner.name}</Text>
                            <Text style={styles.ownerEmail}>{owner.email}</Text>
                          </View>
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingBadgeText}>PENDING</Text>
                          </View>
                        </View>
                        <View style={styles.requestDetails}>
                          <Text style={styles.detailLabel}>Reason:</Text>
                          <Text style={styles.detailValue}>{request.reason}</Text>
                        </View>
                        <View style={styles.requestFooter}>
                          <Text style={styles.requestDate}>Submitted {formatDate(request.createdAt)}</Text>
                        </View>
                      </Card>
                    );
                  })}
                </View>
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Pending Requests</Text>
                  <Text style={styles.emptyMessage}>All your requests have been processed.</Text>
                </Card>
              )
            ) : (
              processedRequests.length > 0 ? (
                processedRequests.map((request) => {
                  const owner = getOwnerData(request);
                  const isApproved = request.status === 'approved';
                  return (
                    <Card
                      key={request._id}
                      style={[
                        styles.requestCard,
                        isApproved ? styles.approvedCard : styles.rejectedCard
                      ]}
                    >
                      <View style={styles.requestHeader}>
                        <View style={[
                          styles.ownerAvatar,
                          isApproved ? styles.approvedAvatar : styles.rejectedAvatar
                        ]}>
                          <Text style={[
                            styles.ownerInitial,
                            isApproved ? { color: colors.success } : { color: colors.error }
                          ]}>
                            {owner.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.requestInfo}>
                          <Text style={styles.ownerName}>{owner.name}</Text>
                          <Text style={styles.ownerEmail}>{owner.email}</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          isApproved ? styles.approvedBadge : styles.rejectedBadge
                        ]}>
                          <Text style={[
                            styles.statusBadgeText,
                            isApproved ? { color: colors.success } : { color: colors.error }
                          ]}>
                            {isApproved ? 'APPROVED' : 'REJECTED'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.requestDetails}>
                        <Text style={styles.detailLabel}>Reason:</Text>
                        <Text style={styles.detailValue}>{request.reason}</Text>
                      </View>
                      {request.adminNote && (
                        <View style={styles.adminNoteContainer}>
                          <Text style={styles.adminNoteLabel}>Admin Note:</Text>
                          <Text style={styles.adminNoteText}>{request.adminNote}</Text>
                        </View>
                      )}
                      <View style={styles.requestFooter}>
                        <Text style={styles.requestDate}>
                          {isApproved ? 'Approved' : 'Rejected'} on {formatDate(request.processedAt || request.createdAt)}
                        </Text>
                      </View>
                    </Card>
                  );
                })
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No History</Text>
                  <Text style={styles.emptyMessage}>No processed requests yet.</Text>
                </Card>
              )
            )}
          </>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
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
  activeTab: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
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
    lineHeight: 22,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    backgroundColor: colors.accent + '08',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  infoIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoIcon: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '700',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  approvedCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  rejectedCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  approvedAvatar: {
    backgroundColor: colors.success + '20',
  },
  rejectedAvatar: {
    backgroundColor: colors.error + '20',
  },
  ownerInitial: {
    ...typography.h4,
    color: colors.warning,
    fontWeight: '600',
  },
  requestInfo: {
    flex: 1,
  },
  ownerName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  ownerEmail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: colors.warning + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  pendingBadgeText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 10,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  approvedBadge: {
    backgroundColor: colors.success + '15',
  },
  rejectedBadge: {
    backgroundColor: colors.error + '15',
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  requestDetails: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  detailValue: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  adminNoteContainer: {
    backgroundColor: colors.error + '08',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  adminNoteLabel: {
    ...typography.caption,
    color: colors.error,
    marginBottom: 4,
    fontWeight: '600',
  },
  adminNoteText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  requestFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  requestDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

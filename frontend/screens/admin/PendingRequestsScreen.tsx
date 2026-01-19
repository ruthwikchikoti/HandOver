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
import { showAlert, showPrompt } from '../../utils/alert';
import { useNavigation } from '@react-navigation/native';
import { useAccess, AccessRequest } from '../../context/AccessContext';
import { RequestCard, LoadingSpinner, EmptyState, Card, Button } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const PendingRequestsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    pendingRequests,
    allRequests,
    fetchPendingRequests,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    loading,
  } = useAccess();
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchPendingRequests(), fetchAllRequests()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getOwnerData = (request: AccessRequest) => {
    const owner = request.ownerId as {
      _id: string;
      name: string;
      email: string;
      isInactive?: boolean;
    };
    return owner;
  };

  const getDependentData = (request: AccessRequest) => {
    const dependent = request.dependentId as {
      _id: string;
      name: string;
      email: string;
    };
    return dependent;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleApprove = async (request: AccessRequest) => {
    const owner = getOwnerData(request);
    const dependent = getDependentData(request);

    showAlert(
      'Approve Request',
      `Are you sure you want to approve ${dependent.name}'s access to ${owner.name}'s vault?`,
      async () => {
        setProcessing(request._id);
        try {
          await approveRequest(request._id);
          showAlert('Success', 'Request has been approved');
        } catch (error) {
          showAlert('Error', 'Failed to approve request');
        } finally {
          setProcessing(null);
        }
      }
    );
  };

  const handleReject = async (request: AccessRequest) => {
    showPrompt(
      'Reject Request',
      'Please provide a reason for rejection (optional):',
      async (adminNote) => {
        setProcessing(request._id);
        try {
          await rejectRequest(request._id, adminNote);
          showAlert('Success', 'Request has been rejected');
        } catch (error) {
          showAlert('Error', 'Failed to reject request');
        } finally {
          setProcessing(null);
        }
      }
    );
  };

  const displayRequests = viewMode === 'pending' ? pendingRequests : allRequests;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = allRequests.filter(r => r.status === 'rejected').length;

  if (loading && pendingRequests.length === 0) {
    return <LoadingSpinner fullScreen message="Loading requests..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Access Requests</Text>
          <View style={{ width: 60 }} />
        </View>
        <Text style={styles.subtitle}>Review and manage vault access requests</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.miniStat, { backgroundColor: colors.warning + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.warning }]}>{pendingRequests.length}</Text>
          <Text style={styles.miniStatLabel}>Pending</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.success + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.success }]}>{approvedCount}</Text>
          <Text style={styles.miniStatLabel}>Approved</Text>
        </View>
        <View style={[styles.miniStat, { backgroundColor: colors.error + '15' }]}>
          <Text style={[styles.miniStatNumber, { color: colors.error }]}>{rejectedCount}</Text>
          <Text style={styles.miniStatLabel}>Rejected</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'pending' && styles.tabActive]}
          onPress={() => setViewMode('pending')}
        >
          <Text style={[styles.tabText, viewMode === 'pending' && styles.tabTextActive]}>
            Pending ({pendingRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'all' && styles.tabActive]}
          onPress={() => setViewMode('all')}
        >
          <Text style={[styles.tabText, viewMode === 'all' && styles.tabTextActive]}>
            All ({allRequests.length})
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
        {displayRequests.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>V</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {viewMode === 'pending' ? 'All Caught Up!' : 'No Requests'}
            </Text>
            <Text style={styles.emptyMessage}>
              {viewMode === 'pending'
                ? 'All access requests have been processed. Great job!'
                : 'No access requests have been made yet.'}
            </Text>
          </Card>
        ) : (
          displayRequests.map((request) => {
            const owner = getOwnerData(request);
            const dependent = getDependentData(request);
            const isPending = request.status === 'pending';
            const isApproved = request.status === 'approved';
            const isProcessing = processing === request._id;

            return (
              <Card
                key={request._id}
                style={[
                  styles.requestCard,
                  isPending && styles.pendingCard,
                  isApproved && styles.approvedCard,
                  !isPending && !isApproved && styles.rejectedCard,
                ]}
              >
                {/* Request Header */}
                <View style={styles.requestHeader}>
                  <View style={[
                    styles.statusIndicator,
                    isPending && { backgroundColor: colors.warning },
                    isApproved && { backgroundColor: colors.success },
                    !isPending && !isApproved && { backgroundColor: colors.error },
                  ]} />
                  <View style={styles.requestMeta}>
                    <Text style={styles.requestDate}>{formatDate(request.createdAt)}</Text>
                    <View style={[
                      styles.statusBadge,
                      isPending && { backgroundColor: colors.warning + '15' },
                      isApproved && { backgroundColor: colors.success + '15' },
                      !isPending && !isApproved && { backgroundColor: colors.error + '15' },
                    ]}>
                      <Text style={[
                        styles.statusText,
                        isPending && { color: colors.warning },
                        isApproved && { color: colors.success },
                        !isPending && !isApproved && { color: colors.error },
                      ]}>
                        {request.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Parties */}
                <View style={styles.partiesSection}>
                  <View style={styles.partyRow}>
                    <View style={styles.partyLabel}>
                      <Text style={styles.partyLabelText}>FROM</Text>
                    </View>
                    <View style={styles.partyInfo}>
                      <View style={[styles.partyAvatar, { backgroundColor: colors.accent + '20' }]}>
                        <Text style={[styles.partyInitial, { color: colors.accent }]}>
                          {dependent.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.partyName}>{dependent.name}</Text>
                        <Text style={styles.partyEmail}>{dependent.email}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>↓</Text>
                  </View>
                  <View style={styles.partyRow}>
                    <View style={styles.partyLabel}>
                      <Text style={styles.partyLabelText}>TO</Text>
                    </View>
                    <View style={styles.partyInfo}>
                      <View style={[styles.partyAvatar, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.partyInitial, { color: colors.primary }]}>
                          {owner.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.partyName}>{owner.name}</Text>
                        <Text style={styles.partyEmail}>{owner.email}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Reason */}
                <View style={styles.reasonSection}>
                  <Text style={styles.reasonLabel}>Request Reason:</Text>
                  <Text style={styles.reasonText}>{request.reason}</Text>
                </View>

                {/* Admin Note */}
                {request.adminNote && (
                  <View style={styles.adminNoteSection}>
                    <Text style={styles.adminNoteLabel}>Admin Note:</Text>
                    <Text style={styles.adminNoteText}>{request.adminNote}</Text>
                  </View>
                )}

                {/* Actions */}
                {isPending && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleReject(request)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.rejectBtnText}>
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.approveBtn]}
                      onPress={() => handleApprove(request)}
                      disabled={isProcessing}
                    >
                      <Text style={styles.approveBtnText}>
                        {isProcessing ? 'Processing...' : 'Approve'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
    ...typography.body,
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
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyIcon: {
    fontSize: 28,
    color: colors.success,
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
  requestCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
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
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  requestMeta: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  partiesSection: {
    marginBottom: spacing.md,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyLabel: {
    width: 40,
  },
  partyLabelText: {
    ...typography.caption,
    color: colors.textTertiary,
    fontWeight: '600',
    fontSize: 10,
  },
  partyInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  partyInitial: {
    ...typography.body,
    fontWeight: '600',
  },
  partyName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  partyEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  arrowContainer: {
    paddingLeft: 40,
    paddingVertical: spacing.xs,
  },
  arrowText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  reasonSection: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: 4,
  },
  reasonText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  adminNoteSection: {
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
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: colors.error + '12',
  },
  rejectBtnText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  approveBtn: {
    backgroundColor: colors.success,
  },
  approveBtnText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccess, AccessRequest } from '../../context/AccessContext';
import { Card, Button, LoadingSpinner, StatusBadge, Input } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

export const RequestDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { allRequests, approveRequest, rejectRequest, fetchAllRequests } = useAccess();
  const { requestId } = route.params;

  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const found = allRequests.find((r) => r._id === requestId);
    if (found) {
      setRequest(found);
    } else {
      fetchAllRequests().then(() => {
        const foundAfterFetch = allRequests.find((r) => r._id === requestId);
        if (foundAfterFetch) {
          setRequest(foundAfterFetch);
        }
      });
    }
  }, [requestId, allRequests]);

  const getOwnerData = () => {
    if (!request) return null;
    return request.ownerId as {
      _id: string;
      name: string;
      email: string;
      isInactive?: boolean;
      lastActivityAt?: string;
    };
  };

  const getDependentData = () => {
    if (!request) return null;
    return request.dependentId as {
      _id: string;
      name: string;
      email: string;
    };
  };

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await approveRequest(requestId, adminNote);
      setProcessing(false);
      showAlert('Success', 'Request has been approved', () => navigation.goBack());
    } catch (error) {
      setProcessing(false);
      showAlert('Error', 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await rejectRequest(requestId, adminNote);
      setProcessing(false);
      showAlert('Success', 'Request has been rejected', () => navigation.goBack());
    } catch (error) {
      setProcessing(false);
      showAlert('Error', 'Failed to reject request');
    }
  };

  if (!request) {
    return <LoadingSpinner fullScreen message="Loading request..." />;
  }

  const owner = getOwnerData();
  const dependent = getDependentData();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Request Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statusContainer}>
          <StatusBadge status={request.status} />
          <Text style={styles.requestDate}>
            Requested on {formatDate(request.createdAt)}
          </Text>
        </View>

        <Card style={styles.personCard}>
          <Text style={styles.personLabel}>Requesting Dependent</Text>
          <View style={styles.personInfo}>
            <View style={styles.personAvatar}>
              <Text style={styles.personInitial}>
                {dependent?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.personName}>{dependent?.name}</Text>
              <Text style={styles.personEmail}>{dependent?.email}</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.personCard}>
          <Text style={styles.personLabel}>Vault Owner</Text>
          <View style={styles.personInfo}>
            <View style={[styles.personAvatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.personInitial, { color: colors.primary }]}>
                {owner?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.personDetails}>
              <Text style={styles.personName}>{owner?.name}</Text>
              <Text style={styles.personEmail}>{owner?.email}</Text>
              <View style={styles.ownerStatus}>
                <Text style={styles.ownerStatusLabel}>Status: </Text>
                <StatusBadge
                  status={owner?.isInactive ? 'inactive' : 'active'}
                  size="small"
                />
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.reasonCard}>
          <Text style={styles.reasonLabel}>Reason for Request</Text>
          <Text style={styles.reasonText}>{request.reason}</Text>
        </Card>

        {request.status === 'pending' && (
          <Card style={styles.actionCard}>
            <Text style={styles.actionTitle}>Admin Action</Text>
            <Input
              label="Admin Note (optional)"
              placeholder="Add a note for the dependent..."
              value={adminNote}
              onChangeText={setAdminNote}
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
            <View style={styles.actionButtons}>
              <Button
                title="Reject"
                onPress={handleReject}
                variant="danger"
                loading={processing}
                style={styles.actionButton}
              />
              <Button
                title="Approve"
                onPress={handleApprove}
                variant="primary"
                loading={processing}
                style={styles.actionButton}
              />
            </View>
          </Card>
        )}

        {request.status !== 'pending' && request.processedAt && (
          <Card style={styles.processedCard}>
            <Text style={styles.processedTitle}>
              {request.status === 'approved' ? 'Approved' : 'Rejected'}
            </Text>
            <Text style={styles.processedDate}>
              on {formatDate(request.processedAt)}
            </Text>
            {request.adminNote && (
              <View style={styles.adminNoteContainer}>
                <Text style={styles.adminNoteLabel}>Admin Note:</Text>
                <Text style={styles.adminNoteText}>{request.adminNote}</Text>
              </View>
            )}
          </Card>
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
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  requestDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  personCard: {
    marginBottom: spacing.md,
  },
  personLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  personInitial: {
    ...typography.h3,
    color: colors.accent,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  personEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  ownerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ownerStatusLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  reasonCard: {
    marginBottom: spacing.md,
  },
  reasonLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  reasonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  actionCard: {
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  processedCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.backgroundTertiary,
  },
  processedTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  processedDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  adminNoteContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  adminNoteLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  adminNoteText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});

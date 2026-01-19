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
import { useNavigation } from '@react-navigation/native';
import { useAccess, AuditLogEntry } from '../../context/AccessContext';
import { LoadingSpinner, EmptyState, Card } from '../../components/common';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const actionLabels: Record<string, string> = {
  entry_created: 'Entry Created',
  entry_updated: 'Entry Updated',
  entry_deleted: 'Entry Deleted',
  dependent_added: 'Dependent Added',
  dependent_removed: 'Dependent Removed',
  access_requested: 'Access Requested',
  access_approved: 'Access Approved',
  access_rejected: 'Access Rejected',
  vault_viewed: 'Vault Viewed',
  settings_updated: 'Settings Updated',
};

const actionIcons: Record<string, string> = {
  entry_created: '+',
  entry_updated: 'E',
  entry_deleted: 'X',
  dependent_added: '@',
  dependent_removed: '-',
  access_requested: '?',
  access_approved: 'V',
  access_rejected: 'X',
  vault_viewed: 'O',
  settings_updated: 'S',
};

const actionColors: Record<string, string> = {
  entry_created: colors.success,
  entry_updated: colors.accent,
  entry_deleted: colors.error,
  dependent_added: colors.categoryContacts,
  dependent_removed: colors.error,
  access_requested: colors.warning,
  access_approved: colors.success,
  access_rejected: colors.error,
  vault_viewed: colors.categoryInsurance,
  settings_updated: colors.primary,
};

export const AuditLogScreen: React.FC = () => {
  const navigation = useNavigation();
  const { auditLogs, fetchAuditLogs, loading } = useAccess();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && auditLogs.length === 0) {
    return <LoadingSpinner fullScreen message="Loading audit log..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Audit Log</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {auditLogs.length === 0 ? (
          <EmptyState
            title="No activity yet"
            message="Your vault activity will appear here"
            icon="#"
          />
        ) : (
          <View style={styles.timeline}>
            {auditLogs.map((log, index) => (
              <View key={log._id} style={styles.logItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: actionColors[log.action] + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.icon,
                        { color: actionColors[log.action] },
                      ]}
                    >
                      {actionIcons[log.action]}
                    </Text>
                  </View>
                  {index < auditLogs.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <Card style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logAction}>
                      {actionLabels[log.action]}
                    </Text>
                    <Text style={styles.logTime}>{formatDate(log.createdAt)}</Text>
                  </View>
                  {log.details && (
                    <Text style={styles.logDetails}>{log.details}</Text>
                  )}
                  {log.category && (
                    <View style={styles.categoryBadge}>
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: categoryColors[log.category] },
                        ]}
                      />
                      <Text style={styles.categoryText}>
                        {log.category.charAt(0).toUpperCase() +
                          log.category.slice(1)}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.performedBy}>
                    by {log.performedBy.name} ({log.performedBy.role})
                  </Text>
                  <Text style={styles.fullDate}>
                    {formatFullDate(log.createdAt)}
                  </Text>
                </Card>
              </View>
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
  scrollContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  timeline: {},
  logItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  logCard: {
    flex: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logAction: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  logTime: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  logDetails: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  performedBy: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  fullDate: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
});

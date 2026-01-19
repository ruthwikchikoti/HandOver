import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { showAlert } from '../../utils/alert';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccess } from '../../context/AccessContext';
import { Button, Input, Card } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

export const RequestAccessScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { requestAccess } = useAccess();

  const { ownerId, ownerName } = route.params;

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for requesting access');
      return;
    }

    if (reason.trim().length < 20) {
      setError('Please provide a more detailed reason (at least 20 characters)');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await requestAccess(ownerId, reason.trim());
      showAlert(
        'Request Submitted',
        'Your access request has been submitted for admin review.'
      );
      navigation.goBack();
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to submit request';
      showAlert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Request Access</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Requesting access to</Text>
            <Text style={styles.ownerName}>{ownerName}'s Vault</Text>
            <Text style={styles.infoDescription}>
              This owner is currently marked as inactive. Your request will be
              reviewed by an administrator before access is granted.
            </Text>
          </Card>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Reason for Access</Text>
            <Text style={styles.sectionDescription}>
              Please explain why you need access to this vault. Be specific and
              provide relevant details.
            </Text>

            <Input
              placeholder="Enter your reason for requesting access..."
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                setError('');
              }}
              multiline
              numberOfLines={6}
              style={styles.reasonInput}
              error={error}
            />

            <Text style={styles.charCount}>
              {reason.length} characters (minimum 20 required)
            </Text>
          </Card>

          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>Important Notes</Text>
            <Text style={styles.noteText}>
              - Your request will be reviewed by an administrator
            </Text>
            <Text style={styles.noteText}>
              - You will only see categories the owner has permitted
            </Text>
            <Text style={styles.noteText}>
              - Access is read-only; you cannot modify entries
            </Text>
            <Text style={styles.noteText}>
              - All access is logged for security purposes
            </Text>
          </Card>

          <Button
            title="Submit Request"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelButton: {
    ...typography.body,
    color: colors.error,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  infoCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  ownerName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  reasonInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  noteCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
  },
  noteTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noteText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../utils/api';
import { showAlert } from '../../utils/alert';
import { Button, Input, Card } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const TAB_BAR_HEIGHT = 70;

export const SettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [inactivityDays, setInactivityDays] = useState(
    String(user?.inactivityDays || 30)
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const days = parseInt(inactivityDays, 10);
    if (isNaN(days) || days < 1 || days > 365) {
      showAlert('Error', 'Inactivity days must be between 1 and 365');
      return;
    }

    setSaving(true);
    try {
      const response = await usersAPI.updateSettings({
        name: name.trim(),
        inactivityDays: days,
      });
      updateUser(response.data);
      showAlert('Success', 'Settings updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save settings';
      showAlert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    showAlert('Logout', 'Are you sure you want to logout?', logout);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: TAB_BAR_HEIGHT + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Owner</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Profile Settings</Text>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
        </Card>

        <Card style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Inactivity Settings</Text>
          <Text style={styles.settingDescription}>
            Your vault will become accessible to approved dependents after this
            many days of inactivity
          </Text>
          <Input
            label="Inactivity Trigger (days)"
            value={inactivityDays}
            onChangeText={setInactivityDays}
            keyboardType="number-pad"
            placeholder="30"
          />
          <Text style={styles.infoText}>
            Range: 1-365 days. Current setting: {user?.inactivityDays} days
          </Text>
        </Card>

        <Button
          title="Save Settings"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />

        <TouchableOpacity
          style={styles.auditButton}
          onPress={() => navigation.navigate('AuditLog')}
        >
          <Text style={styles.auditButtonText}>View Audit Log</Text>
          <Text style={styles.auditArrow}>{'>'}</Text>
        </TouchableOpacity>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />

        <Text style={styles.version}>HandOver v1.0.0</Text>
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
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing.md,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  profileEmail: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primary + '20',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  settingsCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  auditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  auditButtonText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  auditArrow: {
    ...typography.h4,
    color: colors.textTertiary,
  },
  logoutButton: {
    marginBottom: spacing.lg,
  },
  version: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});

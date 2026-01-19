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
import { useNavigation } from '@react-navigation/native';
import { useDependents, Permissions } from '../../context/DependentContext';
import { Button, Input, Card, PermissionToggle } from '../../components/common';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const defaultPermissions: Permissions = {
  assets: false,
  liabilities: false,
  insurance: false,
  contacts: false,
  emergency: false,
  notes: false,
};

export const AddDependentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { addDependent } = useDependents();

  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTogglePermission = (category: keyof Permissions) => {
    setPermissions((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(permissions).every(Boolean);
    const newValue = !allSelected;
    setPermissions({
      assets: newValue,
      liabilities: newValue,
      insurance: newValue,
      contacts: newValue,
      emergency: newValue,
      notes: newValue,
    });
  };

  const handleAdd = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await addDependent(email.trim().toLowerCase(), permissions);
      navigation.goBack();
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Failed to add dependent';
      showAlert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const allSelected = Object.values(permissions).every(Boolean);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Dependent</Text>
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
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Dependent Email</Text>
            <Text style={styles.sectionDescription}>
              Enter the email of someone already registered as a dependent
            </Text>
            <Input
              placeholder="dependent@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />
          </Card>

          <Card style={styles.permissionsCard}>
            <View style={styles.permissionsHeader}>
              <Text style={styles.sectionTitle}>Permissions</Text>
              <TouchableOpacity onPress={handleSelectAll}>
                <Text style={styles.selectAllText}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Choose which categories this person can access when granted
            </Text>

            {(Object.keys(permissions) as Array<keyof Permissions>).map(
              (category) => (
                <PermissionToggle
                  key={category}
                  category={category}
                  enabled={permissions[category]}
                  onToggle={() => handleTogglePermission(category)}
                />
              )
            )}
          </Card>

          <Button
            title="Add Dependent"
            onPress={handleAdd}
            loading={loading}
            style={styles.addButton}
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
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  permissionsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  permissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  selectAllText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  addButton: {
    marginTop: spacing.md,
  },
});

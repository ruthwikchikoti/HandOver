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
import { useVault } from '../../context/VaultContext';
import { Button, Input, Card } from '../../components/common';
import { colors, categoryColors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

const categories = [
  { key: 'assets', label: 'Assets', description: 'Bank accounts, investments' },
  { key: 'liabilities', label: 'Liabilities', description: 'Loans, debts' },
  { key: 'insurance', label: 'Insurance', description: 'Policies, coverage' },
  { key: 'contacts', label: 'Contacts', description: 'Important people' },
  { key: 'emergency', label: 'Emergency', description: 'Urgent info' },
  { key: 'notes', label: 'Notes', description: 'General notes' },
];

export const AddEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { createEntry } = useVault();

  const initialCategory = route.params?.category || 'notes';

  const [category, setCategory] = useState(initialCategory);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createEntry({
        category,
        title: title.trim(),
        content: content.trim(),
      });
      navigation.goBack();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create entry';
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
        <Text style={styles.title}>New Entry</Text>
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
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryButton,
                  category === cat.key && styles.categoryButtonActive,
                  {
                    borderColor:
                      category === cat.key
                        ? categoryColors[cat.key]
                        : colors.border,
                  },
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: categoryColors[cat.key] },
                  ]}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    category === cat.key && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Title"
              placeholder="Enter a title for this entry"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <Text style={styles.contentLabel}>Content</Text>
            <Input
              placeholder="Enter the details..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={8}
              style={styles.contentInput}
              error={errors.content}
            />

            <Button
              title="Save Entry"
              onPress={handleSave}
              loading={loading}
              style={styles.saveButton}
            />
          </Card>
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
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    backgroundColor: colors.white,
  },
  categoryButtonActive: {
    backgroundColor: colors.backgroundSecondary,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  categoryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  categoryLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  formCard: {
    padding: spacing.lg,
  },
  contentLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contentInput: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: spacing.md,
  },
});

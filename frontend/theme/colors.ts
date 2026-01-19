export const colors = {
  // Primary colors
  primary: '#4A5568',
  accent: '#38B2AC',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F7FAFC',
  backgroundTertiary: '#EDF2F7',

  // Text colors
  textPrimary: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#A0AEC0',

  // Status colors
  success: '#48BB78',
  error: '#F56565',
  warning: '#F6AD55',

  // Category colors (pastel)
  categoryAssets: '#68D391',
  categoryLiabilities: '#FC8181',
  categoryInsurance: '#63B3ED',
  categoryContacts: '#B794F4',
  categoryEmergency: '#F6AD55',
  categoryNotes: '#A0AEC0',

  // Utility colors
  white: '#FFFFFF',
  black: '#000000',
  border: '#E2E8F0',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

export const categoryColors: Record<string, string> = {
  assets: colors.categoryAssets,
  liabilities: colors.categoryLiabilities,
  insurance: colors.categoryInsurance,
  contacts: colors.categoryContacts,
  emergency: colors.categoryEmergency,
  notes: colors.categoryNotes,
};

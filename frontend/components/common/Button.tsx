import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = true,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary':
        return colors.accent;
      case 'secondary':
        return colors.backgroundTertiary;
      case 'danger':
        return colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return colors.accent;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textTertiary;
    switch (variant) {
      case 'primary':
      case 'danger':
        return colors.white;
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.accent;
      case 'ghost':
        return colors.accent;
      default:
        return colors.white;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 };
      case 'medium':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 48 };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 56 };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 48 };
    }
  };

  const getBorderStyles = (): ViewStyle => {
    if (variant === 'outline') {
      return {
        borderWidth: 2,
        borderColor: disabled ? colors.border : colors.accent,
      };
    }
    return {};
  };

  const getShadowStyles = (): ViewStyle => {
    if (variant === 'primary' && !disabled) {
      return {
        ...shadows.md,
        shadowColor: colors.accent,
      };
    }
    if (variant === 'danger' && !disabled) {
      return {
        ...shadows.md,
        shadowColor: colors.error,
      };
    }
    return {};
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getSizeStyles(),
          ...getBorderStyles(),
          ...getShadowStyles(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size={size === 'small' ? 'small' : 'small'} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              size === 'small' ? typography.buttonSmall : typography.button,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

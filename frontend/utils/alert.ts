import { Alert, Platform } from 'react-native';

export const showAlert = (title: string, message: string, onConfirm?: () => void) => {
  if (Platform.OS === 'web') {
    if (onConfirm) {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    if (onConfirm) {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: onConfirm },
      ]);
    } else {
      Alert.alert(title, message);
    }
  }
};

export const showPrompt = (
  title: string,
  message: string,
  onSubmit: (value: string) => void,
  defaultValue: string = ''
) => {
  if (Platform.OS === 'web') {
    const result = window.prompt(`${title}\n\n${message}`, defaultValue);
    if (result !== null) {
      onSubmit(result);
    }
  } else {
    Alert.prompt(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: (value) => onSubmit(value || '') },
    ], 'plain-text', defaultValue);
  }
};

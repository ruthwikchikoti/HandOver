import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider } from './context/AuthContext';
import { VaultProvider } from './context/VaultContext';
import { DependentProvider } from './context/DependentContext';
import { AccessProvider } from './context/AccessContext';
import { AppNavigator } from './navigation/AppNavigator';
import { colors } from './theme/colors';

const RootWrapper = Platform.OS === 'web'
  ? ({ children }: { children: React.ReactNode }) => <View style={{ flex: 1 }}>{children}</View>
  : GestureHandlerRootView;

export default function App() {
  return (
    <RootWrapper style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <VaultProvider>
            <DependentProvider>
              <AccessProvider>
                <StatusBar style="dark" backgroundColor={colors.white} />
                <AppNavigator />
              </AccessProvider>
            </DependentProvider>
          </VaultProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </RootWrapper>
  );
}

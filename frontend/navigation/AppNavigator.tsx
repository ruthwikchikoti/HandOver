import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

// Common screen options for modals
const modalScreenOptions = {
  presentation: Platform.OS === 'web' ? 'card' : 'containedModal',
  headerShown: false,
} as const;

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Owner Screens
import { OwnerDashboardScreen } from '../screens/owner/OwnerDashboardScreen';
import { VaultScreen } from '../screens/owner/VaultScreen';
import { AddEntryScreen } from '../screens/owner/AddEntryScreen';
import { EditEntryScreen } from '../screens/owner/EditEntryScreen';
import { DependentsScreen } from '../screens/owner/DependentsScreen';
import { AddDependentScreen } from '../screens/owner/AddDependentScreen';
import { SettingsScreen } from '../screens/owner/SettingsScreen';
import { AuditLogScreen } from '../screens/owner/AuditLogScreen';

// Dependent Screens
import { DependentDashboardScreen } from '../screens/dependent/DependentDashboardScreen';
import { RequestAccessScreen } from '../screens/dependent/RequestAccessScreen';
import { ViewVaultScreen } from '../screens/dependent/ViewVaultScreen';
import { AccessStatusScreen } from '../screens/dependent/AccessStatusScreen';

// Admin Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { PendingRequestsScreen } from '../screens/admin/PendingRequestsScreen';
import { RequestDetailScreen } from '../screens/admin/RequestDetailScreen';
import { AllUsersScreen } from '../screens/admin/AllUsersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Icon Component
const TabIcon: React.FC<{ label: string; focused: boolean }> = ({ label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
    <Text style={[styles.tabIconText, focused && styles.tabIconTextActive]}>
      {label.charAt(0)}
    </Text>
  </View>
);

// Get responsive tab bar height
const getTabBarHeight = (bottomInset: number) => {
  const baseHeight = Platform.OS === 'web' ? 60 : 56;
  return baseHeight + Math.max(bottomInset, Platform.OS === 'ios' ? 0 : 8);
};

// Common tab screen options
const getTabScreenOptions = (insets: { bottom: number }) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: getTabBarHeight(insets.bottom),
    paddingTop: 8,
    paddingBottom: Math.max(insets.bottom, 8),
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarActiveTintColor: colors.accent,
  tabBarInactiveTintColor: colors.textTertiary,
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
    marginBottom: Platform.OS === 'ios' ? 0 : 4,
  },
  tabBarItemStyle: {
    paddingVertical: 4,
  },
});

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Owner Bottom Tabs
const OwnerTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions(insets)}>
      <Tab.Screen
        name="Dashboard"
        component={OwnerDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Vault"
        component={VaultScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Vault" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Dependents"
        component={DependentsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="People" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Owner Stack (Tabs + Modals)
const OwnerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
    <Stack.Screen name="AddEntry" component={AddEntryScreen} options={modalScreenOptions} />
    <Stack.Screen name="EditEntry" component={EditEntryScreen} options={modalScreenOptions} />
    <Stack.Screen name="AddDependent" component={AddDependentScreen} options={modalScreenOptions} />
    <Stack.Screen name="AuditLog" component={AuditLogScreen} options={modalScreenOptions} />
  </Stack.Navigator>
);

// Dependent Bottom Tabs
const DependentTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions(insets)}>
      <Tab.Screen
        name="Dashboard"
        component={DependentDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Status"
        component={AccessStatusScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Status" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Dependent Stack (Tabs + Modals)
const DependentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DependentTabs" component={DependentTabs} />
    <Stack.Screen name="RequestAccess" component={RequestAccessScreen} options={modalScreenOptions} />
    <Stack.Screen name="ViewVault" component={ViewVaultScreen} options={modalScreenOptions} />
  </Stack.Navigator>
);

// Admin Bottom Tabs
const AdminTabs = () => {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={getTabScreenOptions(insets)}>
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Requests"
        component={PendingRequestsScreen}
        options={{
          tabBarLabel: 'Requests',
          tabBarIcon: ({ focused }) => <TabIcon label="Requests" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Users"
        component={AllUsersScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Users" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Stack (Tabs + Modals)
const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminTabs" component={AdminTabs} />
    <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} options={modalScreenOptions} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={modalScreenOptions} />
    <Stack.Screen name="AllUsers" component={AllUsersScreen} options={modalScreenOptions} />
  </Stack.Navigator>
);

// Main App Navigator
export const AppNavigator: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'owner' ? (
        <OwnerStack />
      ) : user.role === 'dependent' ? (
        <DependentStack />
      ) : user.role === 'admin' ? (
        <AdminStack />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: colors.accent + '20',
  },
  tabIconText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textTertiary,
  },
  tabIconTextActive: {
    color: colors.accent,
  },
});

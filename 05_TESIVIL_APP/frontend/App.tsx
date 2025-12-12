import { StatusBar } from 'expo-status-bar';
import { PowerSyncProvider } from './src/powersync/PowerSyncProvider';
import { AuthProvider } from './src/auth/AuthProvider';
import React from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PowerSyncProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </PowerSyncProvider>
    </AuthProvider>
  );
}

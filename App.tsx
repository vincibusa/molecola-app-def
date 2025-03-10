import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Typography, Colors } from 'react-native-ui-lib';
import { enableScreens } from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/services/NotificationService';

// Abilita react-native-screens
enableScreens();

// Configurazione di react-native-ui-lib
Colors.loadColors({
  primary: '#e91e63',
  secondary: '#2196f3',
  accent: '#00e676',
  grey10: '#20303C',
  grey20: '#43515C',
  grey30: '#66737C',
  grey40: '#858F96',
  grey50: '#A3ABB0',
  grey60: '#C2C7CB',
  grey70: '#E0E3E5',
  grey80: '#F2F4F5',
  green30: '#26a69a',
  red30: '#f44336',
  yellow30: '#fdd835',
  blue30: '#2196f3',
});

Typography.loadTypographies({
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16 },
  text60: { fontSize: 18, fontWeight: 'bold' },
  text70: { fontSize: 16 },
  text80: { fontSize: 14 },
});

export default function App() {
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
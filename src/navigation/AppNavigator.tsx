import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import ReservationListScreen from '../screens/ReservationListScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2962ff',
          tabBarInactiveTintColor: '#8d99ae',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 64,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 12,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#f0f4f8',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f4f8',
            height: 90,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: '#191919',
          },
          headerTitleAlign: 'center',
        }}
      >
        <Tab.Screen
          name="Reservations"
          component={ReservationListScreen}
          options={{
            title: 'Prenotazioni',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar-clock" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Impostazioni',
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AppNavigator from './App.Navigator';
import LoadDataScreen from '../screens/LoadData.Screen';

export default function NotLoggedInScreen() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Load Data"
        component={LoadDataScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        name="App Navigator"
        component={AppNavigator}
      />
    </Stack.Navigator>
  );
}

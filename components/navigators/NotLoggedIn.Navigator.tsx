import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Login.Screen';

export default function NotLoggedInNavigator() {
  const Stack = createStackNavigator();

  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Login"
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
}

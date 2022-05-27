import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/Profile.Screen';
import SettingsScreen from '../screens/Settings.Screen';

const Stack = createStackNavigator();

export default function PostsNavigator() {
  return (
    <Stack.Navigator>

      <Stack.Screen component={ProfileScreen} name="Profile" />

      <Stack.Screen component={SettingsScreen} name="Settings" />

    </Stack.Navigator>
  );
}

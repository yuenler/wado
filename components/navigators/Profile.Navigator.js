import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/Profile.Screen';
import EditProfileScreen from '../screens/EditProfile.Screen';

import ViewFullPostScreen from '../screens/ViewFullPost.Screen';
import LoginScreen from '../screens/Login.Screen';

const Stack = createStackNavigator();

export default function PostsNavigator() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        options={{ headerShown: false }}
        component={ProfileScreen}
        name="Profile"
      />

      <Stack.Screen component={ViewFullPostScreen} name="View Full Post" />

      <Stack.Screen component={EditProfileScreen} name="Edit Profile" />

      <Stack.Screen name="Login" component={LoginScreen} />

    </Stack.Navigator>
  );
}

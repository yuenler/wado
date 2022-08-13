import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/Profile.Screen';
import EditProfileScreen from '../screens/EditProfile.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';
import { useTheme } from '../../ThemeContext';

const Stack = createStackNavigator();

export default function PostsNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator>

      <Stack.Screen
        options={{ headerShown: false }}
        component={ProfileScreen}
        name="Profile"
      />

      <Stack.Screen
        component={ViewFullPostScreen}
        name="View Full Post"
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />

      <Stack.Screen
        component={EditProfileScreen}
        name="Edit Profile"
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />

    </Stack.Navigator>
  );
}

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PostsScreen from '../screens/Posts.Screen';
import CreatePostScreen from '../screens/CreatePost.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';
import MapPreviewScreen from '../screens/MapPreview.Screen';
import { useTheme } from '../../ThemeContext';
import EditProfileScreen from '../screens/EditProfile.Screen';

const Stack = createStackNavigator();

export default function PostsNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator>
      <Stack.Screen
        component={PostsScreen}
        name="Posts"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={CreatePostScreen}
        name="Create Post"

        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}

      />

      <Stack.Screen
        component={ViewFullPostScreen}
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
        name="View Full Post"
      />

      <Stack.Screen
        component={MapPreviewScreen}
        name="Map Preview"
        options={({ route }) => ({
          title: route.params.postalAddress,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        })}
      />

      <Stack.Screen
        component={EditProfileScreen}
        name="Edit Profile"
        options={{
          headerTitle: '',
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
        }}
      />

    </Stack.Navigator>
  );
}

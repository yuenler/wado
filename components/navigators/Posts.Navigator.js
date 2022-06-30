import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PostsScreen from '../screens/Posts.Screen';
import CreatePostScreen from '../screens/CreatePost.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';
import MapPreviewScreen from '../screens/MapPreview.Screen';

const Stack = createStackNavigator();

export default function PostsNavigator() {
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
        options={{ headerTitle: '' }}
      />

      <Stack.Screen
        component={ViewFullPostScreen}
        options={{ headerTitle: '' }}
        name="View Full Post"
      />

      <Stack.Screen
        component={MapPreviewScreen}
        name="Map Preview"
        options={({ route }) => ({ title: route.params.postalAddress })}
      />

    </Stack.Navigator>
  );
}

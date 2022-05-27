/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import PostsNavigator from './Posts.Navigator';
import MapNavigator from './Map.Navigator';

export default function AppNavigator() {
  const Tabs = createBottomTabNavigator();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'MapNavigator') {
            iconName = 'map';
          } else if (route.name === 'PostsNavigator') {
            iconName = 'list';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          {
            display: 'flex',
          },
          null,
        ],
      })}
    >

      <Tabs.Screen name="MapNavigator" component={MapNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="PostsNavigator" component={PostsNavigator} options={{ headerShown: false }} />
    </Tabs.Navigator>

  );
}

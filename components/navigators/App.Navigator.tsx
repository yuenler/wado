import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import PostsNavigator from './Posts.Navigator';
import MapNavigator from './Map.Navigator';
import ProfileNavigator from './Profile.Navigator';

export default function AppNavigator() {
  const getIcon = (name: string, size: number, color: string) => {
    let iconName: string;
    if (name === 'MapNavigator') {
      iconName = 'map-marker';
    } else if (name === 'PostsNavigator') {
      iconName = 'list';
    } else if (name === 'ProfileNavigator') {
      iconName = 'user';
    } else {
      iconName = 'smile-o';
    }
    return <FontAwesome name={iconName} size={size} color={color} />;
  };

  const Tabs = createBottomTabNavigator();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#a76af7',
        tabBarIcon: ({ color, size }) => getIcon(route.name, size, color),
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
      <Tabs.Screen name="ProfileNavigator" component={ProfileNavigator} options={{ headerShown: false }} />

    </Tabs.Navigator>

  );
}

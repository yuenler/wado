import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import PostsNavigator from './Posts.Navigator';
import MapNavigator from './Map.Navigator';
import ProfileNavigator from './Profile.Navigator';
import { useTheme } from '../../ThemeContext';

export default function AppNavigator() {
  const { colors } = useTheme();

  const getIcon = (name: string, size: number, color: string) => {
    if (name === 'MapNavigator') {
      return <FontAwesome name={'map-marker'} size={size} color={color} />;
    } if (name === 'PostsNavigator') {
      return <FontAwesome name={'list'} size={size} color={color} />;
    } if (name === 'ProfileNavigator') {
      return <FontAwesome name={'user'} size={size} color={color} />;
    }
    return <FontAwesome name={'smile-o'} size={size} color={color} />;
  };

  const Tabs = createBottomTabNavigator();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        // set background color to black
        tabBarActiveTintColor: '#a76af7',
        tabBarIcon: ({ color, size }) => getIcon(route.name, size, color),
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          {
            display: 'flex',
            backgroundColor: colors.background,
          },
          null,
        ],

      })}
    >
      <Tabs.Screen name="PostsNavigator" component={PostsNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="MapNavigator" component={MapNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="ProfileNavigator" component={ProfileNavigator} options={{ headerShown: false }} />

    </Tabs.Navigator>

  );
}

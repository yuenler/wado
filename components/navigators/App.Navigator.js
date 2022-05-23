import React from 'react';
import PostsNavigator from './Posts.Navigator';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import MapNavigator from './Map.Navigator';


const Tabs = createBottomTabNavigator();

export default class AppNavigator extends React.Component {

  render() {

    return (
  
      <Tabs.Navigator

      screenOptions={({ route }) => ({
        tabBarIcon: ({color, size }) => {
          let iconName;

          if (route.name === 'MapNavigator') {
            iconName = 'map';
          }
          else if (route.name === 'PostsNavigator') {
            iconName = 'list';
          }

          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        "tabBarShowLabel": false,
        "tabBarStyle": [
          {
            "display": "flex"
          },
          null
        ]
      })}
      
      
      >
        
      <Tabs.Screen name="MapNavigator" component={MapNavigator} options={{ headerShown: false }} />
      <Tabs.Screen name="PostsNavigator" component={PostsNavigator} options={{ headerShown: false }}/>
      </Tabs.Navigator>


    )
  }
}
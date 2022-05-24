import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MapScreen from '../screens/Map.Screen';
import ViewFullPostScreen from '../screens/ViewFullPost.Screen';

import {Icon} from 'react-native-elements'

const Stack = createStackNavigator();

export default class MapNavigator extends React.Component {
  render() {
    return (
      <Stack.Navigator
      // screenOptions={{
      //   headerShown: false
      // }}
      >

        <Stack.Screen component={MapScreen} name="Maps"
        options={{headerShown: false}} 
        // options={{
        //   headerStyle: {
        //     backgroundColor: '#871609',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //   },
        //   headerRight: () => (
        //     <Icon
        //       onPress={() => this.props.navigation.navigate('Create Post')}
        //       name="plus"
        //       type = "ant-design"
        //       color = '#000000'
        //       raised
        //     />
        //   )

        // }}
        />
        {/* <Stack.Screen component={CreatePostScreen} name="Create Post" 
        options={{
          headerStyle: {
            backgroundColor: '#871609',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },

        }}
        /> */}

      <Stack.Screen component={ViewFullPostScreen} name="View Full Post" 
        // options={{
        //   headerStyle: {
        //     backgroundColor: '#871609',
        //   },
        //   headerTintColor: '#fff',
        //   headerTitleStyle: {
        //     fontWeight: 'bold',
        //   },

        // }}
        />
        
      </Stack.Navigator>
    )
  }
}
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable global-require */
import React, { useEffect, useState } from 'react';
import {
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import LoadDataScreen from './components/screens/LoadData.Screen';
import globalStyles from './globalStyles';
import { useTheme } from './Context';
import { getData } from './helpers';

export default function NavContainer({ user } : { user: any}) {
  const {
    colors, isDark, setUser, setYear, setHouse, setFirstTime, setToastPressed,
  } = useTheme();
  const styles = globalStyles(colors);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // get user data from async storage
    if (user) {
      setUser(user);
      getData('@year').then((y) => {
        if (y) {
          setYear(y);
          setFirstTime(false);
        }
        getData('@house').then((h) => {
          if (h) {
            setHouse(h);
            setFirstTime(false);
          }
          setLoaded(true);
        });
      });
    }
  }, [user]);

  return <NavigationContainer>
        <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
          {(loaded && user) ? <LoadDataScreen /> : <NotLoggedInNavigator />}
        </View>
        <Toast
        position="bottom"
        bottomOffset={90}
        onPress={() => { setToastPressed(true); }}
      />
      </NavigationContainer>;
}

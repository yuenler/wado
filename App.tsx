/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import 'firebase/compat/database';
import { NavigationContainer } from '@react-navigation/native';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import NotLoggedInNavigator from './components/navigators/NotLoggedIn.Navigator';
import LoadDataScreen from './components/screens/LoadData.Screen';
import ApiKeys from './ApiKeys';
import { LiveUserSpecificPost } from './types/Post';
import globalStyles from './globalStyles';
import { Provider, useTheme } from './Context';
import { getData } from './helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

declare global {
  var user: any;
  var school: string;
  var posts: LiveUserSpecificPost[];
  var latitude: number;
  var longitude: number;
  var year: string;
  var house: string;
  var firstTime: boolean;
}

function NavContainer({ isAuthenticated } : {isAuthenticated: boolean}) {
  const { colors, isDark } = useTheme();
  const styles = globalStyles(colors);
  return <NavigationContainer>
        <View style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
          {(isAuthenticated) ? <LoadDataScreen /> : <NotLoggedInNavigator />}
        </View>
      </NavigationContainer>;
}

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    setUser, setYear, setHouse, setFirstTime,
  } = useTheme();

  const onAuthStateChanged = (user: any) => {
    setIsAuthenticationReady(true);
    if (!user) {
      setIsAuthenticated(false);
    }
    if (user) {
      const idxHarvard = user.email.indexOf('harvard.edu');
      if (idxHarvard === -1 && user.email !== 'theofficialbhsapptesting@gmail.com' && user.email !== 'cykai168@gmail.com' && user.email !== 'tlkm4sh@gmail.com') {
        firebase.auth().signOut();
        Toast.show({
          type: 'error',
          text1: 'You must use a Harvard email to sign in.',
        });
      } else {
        setIsAuthenticated(true);
        // get user data from async storage
        setFirstTime(true);
        setUser(user);
        getData('@year').then((y) => {
          if (y) {
            setYear(y);
            setFirstTime(false);
          }
        });
        getData('@house').then((h) => {
          if (h) {
            setHouse(h);
            setFirstTime(false);
          }
        });
      }
    }
  };

  if (!firebase.apps.length) {
    const app = firebase.initializeApp(ApiKeys.FirebaseConfig);
    initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  firebase.auth().onAuthStateChanged(onAuthStateChanged);

  const loadFonts = async () => {
    await Font.loadAsync({
      // Load a font `Montserrat` from a static resource
      Montserrat: require('./assets/Montserrat-Regular.ttf'),
      MontserratBold: require('./assets/Montserrat-Bold.ttf'),
    });
    setIsLoadingComplete(true);
  };

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        // ... notify user of update ...
        Toast.show({
          type: 'success',
          text1: 'Update available! Wado is restarting.',
        });
        Updates.reloadAsync();
      }
    } catch (e) {
      // handle or log error
    }
  };

  useEffect(() => {
    checkForUpdates();
    loadFonts();
  }, []);

  if (!isLoadingComplete || !(isAuthenticationReady || isAuthenticated)) {
    return (
      null
    );
  }
  return (
    <Provider>
      <NavContainer isAuthenticated={isAuthenticated}/>
      <Toast
        position="bottom"
        bottomOffset={40}
      />
    </Provider>
  );
}

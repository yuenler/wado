/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  View, Platform, StatusBar,
} from 'react-native';
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
import { ThemeProvider, useTheme } from './ThemeContext';
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
  var archive: LiveUserSpecificPost[];
  var starred: LiveUserSpecificPost[];
  var ownPosts: LiveUserSpecificPost[];
  var latitude: number;
  var longitude: number;
  var year: string;
  var house: string;
  var firstTime: boolean;
}

export default function App() {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkedForUpdates, setCheckedForUpdates] = useState(false);

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
        global.firstTime = true;
        global.user = user;
        getData('@year').then((year) => {
          if (year) {
            global.year = year;
            global.firstTime = false;
          }
        });
        getData('@house').then((house) => {
          if (house) {
            global.house = house;
            global.firstTime = false;
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
    setCheckedForUpdates(true);
  };

  useEffect(() => {
    checkForUpdates();
    loadFonts();
  }, []);

  if (!isLoadingComplete || !(isAuthenticationReady || isAuthenticated) || !checkedForUpdates) {
    return (
      null
    );
  }
  return (
    <ThemeProvider>
      <NavigationContainer>
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          {(isAuthenticated) ? <LoadDataScreen /> : <NotLoggedInNavigator />}
        </View>
      </NavigationContainer>
      <Toast
        position="bottom"
        bottomOffset={20}
      />
    </ThemeProvider>

  );
}

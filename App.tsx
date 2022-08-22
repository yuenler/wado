/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import 'firebase/compat/database';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import ApiKeys from './ApiKeys';
import { Provider } from './Context';
import NavContainer from './NavContainer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const [isAuthenticationReady, setIsAuthenticationReady] = useState(false);
  const [user, setUser] = useState(null);

  const onAuthStateChanged = (u: any) => {
    setIsAuthenticationReady(true);
    if (!u) {
      setUser(null);
    }
    if (u) {
      const idxHarvard = u.email.indexOf('harvard.edu');
      if (idxHarvard === -1 && u.email !== 'theofficialbhsapptesting@gmail.com' && u.email !== 'cykai168@gmail.com' && u.email !== 'tlkm4sh@gmail.com') {
        firebase.auth().signOut();
        Toast.show({
          type: 'error',
          text1: 'You must use a Harvard email to sign in.',
        });
      } else {
        setUser(u);
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

  if (!isLoadingComplete || !(isAuthenticationReady || user)) {
    return (
      null
    );
  }
  return (
    <Provider>
      <NavContainer user={user}/>
    </Provider>
  );
}

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
          text1: 'We don\'t recognize your school email.',
          text2: 'It\'s possible that Wado is not available at your school yet.',
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

  useEffect(() => {
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

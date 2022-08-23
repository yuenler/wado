/* eslint-disable global-require */
import React, { useEffect } from 'react';
import * as Location from 'expo-location';
import firebase from 'firebase/compat/app';
import { loadPosts } from '../../helpers';
import { useTheme } from '../../Context';
import AppNavigator from '../navigators/App.Navigator';
import 'firebase/compat/database';

export default function LoadDataScreen() {
  const {
    setAllPosts, house, year, user, setUserLatitude, setUserLongitude,
  } = useTheme();

  useEffect(() => {
    (async () => {
      if (user.uid) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLatitude(location.coords.latitude);
          setUserLongitude(location.coords.longitude);
          // save users location to firebase
          try {
            firebase.database().ref(`users/${user.uid}`).update({
              location: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
            });
          } catch (error) {
          // do nothing
          }
        }
      }
    })();
  }, [user]);

  useEffect(() => {
    if (user.uid) {
      loadPosts(house, year, user, false).then((cachedPosts) => {
        setAllPosts(cachedPosts);
        loadPosts(house, year, user, true).then((cachedAndUncachedPosts) => {
          setAllPosts(cachedAndUncachedPosts);
        });
      });
    }
  }, [house, year, user]);

  return <AppNavigator />;
}

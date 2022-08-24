/* eslint-disable camelcase */
/* eslint-disable global-require */
import React from 'react';
import {
  Text, Image, View,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Button } from '@rneui/base';
import globalStyles from '../../globalStyles';
import { useTheme } from '../../Context';
import ApiKeys from '../../ApiKeys';
import registerForPushNotificationsAsync from '../../registerForPushNotificationsAsync';

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: '59659678787-11cvfekeiqnseceuajghocogcjsqtvlm.apps.googleusercontent.com',
      androidClientId: ApiKeys.GoogleConfig.androidClientId,
      iosClientId: ApiKeys.GoogleConfig.iosClientId,
    },
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then((userCredential) => {
        const { user } = userCredential;
        firebase.database().ref(`/users/${user.uid}`).set({
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
        });
        try {
          registerForPushNotificationsAsync().then((pushNotificationToken) => firebase.database().ref(`/users/${user.uid}`).update({
            pushNotificationToken,
          }));
        } catch (error) {
          // nothing
        }
      });
    }
  }, [response]);

  return (
    <View style={[styles.container, { backgroundColor: colors.purple }]}>
      <View style={styles.titleContainer}>
        <Image source={require('../../assets/iconTransparent.png')} style={styles.image}/>
        <Text style={[styles.loginTitle, { color: 'white' }]}>Wado</Text>
      </View>
      <View style={{ marginHorizontal: '10%', flex: 1 }}>
        <Button
          onPress={() => promptAsync()}
          buttonStyle={styles.loginButton}
          icon={<Image style={styles.tinyLogo} source={require('../../assets/google.jpg')} />}
          title="Sign in with Google"
          titleStyle={styles.loginButtonText}
        />
        <View style={{ marginTop: 10, alignItems: 'center' }}>
          <Text style={[styles.text, { textAlign: 'center', color: 'white' }]}>Please sign in using your college email address.</Text>
        </View>
      </View>

    </View>
  );
}

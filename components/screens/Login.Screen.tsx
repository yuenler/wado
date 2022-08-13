/* eslint-disable camelcase */
/* eslint-disable global-require */
import React, { useState } from 'react';
import {
  Text, Image, View, Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Button } from '@rneui/base';
import { ListItem, Avatar } from '@rneui/themed';
import TouchableScale from 'react-native-touchable-scale';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../../styles';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import ApiKeys from '../../ApiKeys';

export default function LoginScreen() {
  const [school, setSchool] = useState('');
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
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return (
    <View style={[styles.container, { backgroundColor: '#a76af7' }]}>
      <View style={styles.titleContainer}>
        <Image source={require('../../assets/icon.png')} style={styles.image}/>
        <Text style={[styles.loginTitle, { color: 'white' }]}>Wado</Text>
      </View>

      {!school
        ? (
          <View style={{ margin: '10%', flex: 1 }}>
            <Text style={[styles.question, { color: 'white' }]}>What school do you go to?</Text>
            <View style={{ margin: 20 }}>
              <ListItem
                Component={TouchableScale}
                linearGradientProps={{
                  colors: ['#F44336', '#A51C30'],
                  start: { x: 1, y: 0 },
                  end: { x: 0.2, y: 0 },
                }}
                ViewComponent={LinearGradient}
                onPress={() => setSchool('Harvard')}
                containerStyle={{
                  borderRadius: 8,
                }}
              >
                <Avatar rounded source={require('../../assets/Harvard-symbol.jpg')} />
                <ListItem.Content>
                  <ListItem.Title style={{ color: 'white', fontWeight: 'bold' }}>
                    Harvard University
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color="white" />
              </ListItem>
            </View>

            <View style={{ margin: 20 }}>
              <ListItem
                Component={TouchableScale}
                linearGradientProps={{
                  colors: ['#3474eb', '#200b99'],
                  start: { x: 1, y: 0 },
                  end: { x: 0.2, y: 0 },
                }}
                ViewComponent={LinearGradient}
                containerStyle={{
                  borderRadius: 8,
                }}
                onPress={() => Alert.alert('', 'This is app is currently only available for Harvard students. Please email yuenlerchow@college.harvard.edu about your interest for this app at your school.')}
              >

                <Avatar rounded containerStyle={{ backgroundColor: 'transparent' }} />
                <ListItem.Content>
                  <ListItem.Title style={{ color: 'white', fontWeight: 'bold' }}>
                    Another University
                  </ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron color="white" />
              </ListItem>
            </View>
          </View>
        )
        : (
          <View style={{ marginHorizontal: '10%', flex: 1 }}>
            <Button
              onPress={() => promptAsync()}
              buttonStyle={styles.loginButton}
              icon={<Image style={styles.tinyLogo} source={require('../../assets/google.jpg')} />}
              title="Sign in with Google"
              titleStyle={styles.loginButtonText}
            />
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={[styles.text, { textAlign: 'center', color: 'white' }]}>Please sign in using your Harvard University email address.</Text>
              <Text
                style={[styles.text, { color: 'lightgreen', textDecorationLine: 'underline', textAlign: 'center' }]}
                onPress={() => setSchool('')}
              >
                {'Don\'t go to Harvard? Choose a different school.'}
              </Text>
            </View>
          </View>
        )}

    </View>
  );
}

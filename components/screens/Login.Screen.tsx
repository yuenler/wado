/* eslint-disable camelcase */
/* eslint-disable global-require */
import React, { useState } from 'react';
import {
  StyleSheet, Text, Image, View, Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { Button } from '@rneui/base';
import { ListItem, Avatar } from '@rneui/themed';
import TouchableScale from 'react-native-touchable-scale';
import { LinearGradient } from 'expo-linear-gradient';
import globalStyles from '../GlobalStyles';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import ApiKeys from '../../ApiKeys';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 60,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#ededed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#000000',
  },
  titleContainer: {
    marginTop: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 80,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  image: {
    width: 150,
    height: 150,
  },
});

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
    <View style={[globalStyles.container, { backgroundColor: '#a76af7' }]}>
      <View style={styles.titleContainer}>
        <Image source={require('../../assets/icon.png')} style={styles.image}/>
        <Text style={[styles.title, { color: 'white' }]}>Wado</Text>
      </View>

      {!school
        ? (
          <View style={{ margin: '10%', flex: 1 }}>
            <Text style={[globalStyles.question, { color: 'white' }]}>What school do you go to?</Text>
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
              buttonStyle={styles.button}
              icon={<Image style={styles.tinyLogo} source={require('../../assets/google.jpg')} />}
              title="Sign in with Google"
              titleStyle={styles.buttonText}
            />
            <View style={{ marginTop: 10, alignItems: 'center' }}>
              <Text style={[globalStyles.text, { textAlign: 'center', color: 'white' }]}>Please sign in using your Harvard University email address.</Text>
              <Text
                style={[globalStyles.text, { color: 'lightgreen', textDecorationLine: 'underline', textAlign: 'center' }]}
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

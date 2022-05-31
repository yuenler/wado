/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  View, Text, useWindowDimensions,
} from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { TabView } from 'react-native-tab-view';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import globalStyles from '../GlobalStyles';
import { getUser } from '../../helpers';
import ProfilePostsComponent from './ProfilePosts.Component';

let user = {};

function FirstRoute({ navigation }) {
  return <ProfilePostsComponent type="ownPosts" user={user} navigation={navigation} />;
}

function SecondRoute({ navigation }) {
  return <ProfilePostsComponent type="starred" user={user} navigation={navigation} />;
}

function ThirdRoute({ navigation }) {
  return <ProfilePostsComponent type="archive" user={user} navigation={navigation} />;
}

export default function ProfileScreen({ navigation }) {
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'ownPosts', title: 'Your Posts' },
    { key: 'starred', title: 'Starred' },
    { key: 'archive', title: 'Archive' },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'ownPosts':
        return <FirstRoute navigation={navigation} />;
      case 'starred':
        return <SecondRoute navigation={navigation} />;
      case 'archive':
        return <ThirdRoute navigation={navigation} />;
      default:
        return null;
    }
  };

  const getData = async () => {
    if (Object.keys(user).length === 0) {
      user = await getUser();
    }
    setPhoto(user.photoURL);
    setName(user.displayName);

    firebase.database().ref(`users/${user.uid}`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMajor(data.major);
        setYear(data.year);
      }
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={globalStyles.container}>

      <View style={{ flexDirection: 'row', margin: 20 }}>
        <View style={{ marginRight: 20 }}>
          <Icon
            name="settings"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
        <Icon
          name="edit"
          onPress={() => navigation.navigate('Edit Profile')}
        />

      </View>
      <View style={{ alignItems: 'center' }}>
        {photo !== ''
          ? (
            <Avatar
              size="large"
              rounded
              source={{
                uri:
                  photo,
              }}
            />
          ) : null}
        <Text style={globalStyles.title}>{name}</Text>
        {year && year !== ''
          ? <Text style={globalStyles.text}>{year}</Text>
          : null}
        {year && year !== ''
          ? <Text style={globalStyles.text}>{major}</Text>
          : null}

      </View>

      <TabView
        style={{ marginTop: 20 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

    </View>
  );
}

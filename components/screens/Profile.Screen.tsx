import React, { useState, useEffect } from 'react';
import {
  View, Text, useWindowDimensions, Alert,
} from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { TabView, TabBar } from 'react-native-tab-view';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import globalStyles from '../GlobalStyles';
import ProfilePostsComponent from './ProfilePosts.Component';
import { removeUser } from '../../helpers';
import { Post } from '../../types/Post';

function FirstRoute({ navigation, setUndo, setArchive } :{navigation: any, setUndo: any, setArchive: any}) {
  return (
    <ProfilePostsComponent
      type="starred"
      navigation={navigation}
      setUndo={setUndo}
      setArchive={setArchive}
    />
  );
}

function SecondRoute({ navigation, setUndo, setArchive }:{navigation: any, setUndo: any, setArchive: any}) {
  return (
    <ProfilePostsComponent
      type="ownPosts"
      navigation={navigation}
      setUndo={setUndo}
      setArchive={setArchive}
    />
  );
}

function ThirdRoute({ navigation, setUndo, setArchive }:{navigation: any, setUndo: any, setArchive: any}) {
  return (
    <ProfilePostsComponent
      type="archive"
      navigation={navigation}
      setUndo={setUndo}
      setArchive={setArchive}
    />
  );
}

FirstRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

SecondRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

ThirdRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default function ProfileScreen({ navigation } : {navigation: any, }) {
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'starred', title: 'Starred' },
    { key: 'ownPosts', title: 'Your Posts' },
    { key: 'archive', title: 'Archive' },
  ]);
  const [undo, setUndo] = useState<{show: true, post: Post} | {show: false}>({
    show: false,
  });
  const [archive, setArchive] = useState('');

  const showToast = (text: string) => {
    Toast.show({
      type: 'success',
      text1: text,
    });
  };

  const undoArchive = () => {
    try {
      if (undo.show) {
        Toast.hide();
        showToast('Unarchived.');
        firebase.database().ref(`users/${global.user.uid}/archive/${undo.post.id}`).remove();
        // remove undo.post from global.archive
        global.archive = global.archive.filter((p) => p.id !== undo.post.id);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const renderScene = ({ route } : {route: any}) => {
    switch (route.key) {
      case 'starred':
        return <FirstRoute navigation={navigation} setUndo={setUndo} setArchive={setArchive} />;
      case 'ownPosts':
        return <SecondRoute navigation={navigation} setUndo={setUndo} setArchive={setArchive} />;
      case 'archive':
        return <ThirdRoute navigation={navigation} setUndo={setUndo} setArchive={setArchive} />;
      default:
        return null;
    }
  };

  const getData = async () => {
    setPhoto(global.user.photoURL);
    setName(global.user.displayName);

    firebase.database().ref(`users/${global.user.uid}`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setMajor(data.major);
        setYear(data.year);
      }
    });
  };

  const renderTabBar = (props: any) => (
    <TabBar
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      indicatorStyle={{ backgroundColor: '#a76af7' }}
      style={{ backgroundColor: 'white' }}
      renderLabel={({ route }) => (
        <Text style={globalStyles.text}>
          {route.title}
        </Text>
      )}
    />
  );

  const removeUserFromStorage = async () => {
    await removeUser();
  };

  const signOut = () => {
    removeUserFromStorage();
    firebase.auth().signOut()
      .then(() => {
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  const signOutConfirmation = () => {
    Alert.alert(
      '',
      'Are you sure you want to sign out?',

      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'Yes', onPress: () => signOut() },
      ],
      { cancelable: true },
    );
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (undo.show) {
      showToast('Post archived! Click here to undo.');
    }
  }, [undo]);

  useEffect(() => {
    // remove archive from upcomingUnarchivedPosts
    global.posts = global.posts.filter((p) => p.id !== archive);
  }, [archive]);

  return (
    <View style={globalStyles.container}>

      <View style={{ flexDirection: 'row', margin: 20 }}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          <Icon
            name="edit"
            color='#a76af7'
            reverse
            onPress={() => navigation.navigate('Edit Profile')}
          />
        </View>
        <View>
          <Icon
            name="logout"
            color='#a76af7'
            reverse
            onPress={() => signOutConfirmation()}
          />
        </View>
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
          <View style={{
            backgroundColor: '#a76af7', padding: 10, borderRadius: 10, marginTop: 10,
          }}>
        <Text style={[globalStyles.title, { color: 'white' }]}>{name}</Text>
        </View>
        {year && year !== ''
          ? <Text style={globalStyles.text}>{year}</Text>
          : null}
        {year && year !== ''
          ? <Text style={globalStyles.text}>{major}</Text>
          : null}

      </View>

      <TabView
        renderTabBar={renderTabBar}
        style={{ marginTop: 20 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />

      <Toast
        position="bottom"
        bottomOffset={20}
        onPress={() => undoArchive()}
      />

    </View>
  );
}

ProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

FirstRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setUndo: PropTypes.func.isRequired,
  setArchive: PropTypes.func.isRequired,
};

SecondRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setUndo: PropTypes.func.isRequired,
  setArchive: PropTypes.func.isRequired,
};

ThirdRoute.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  setUndo: PropTypes.func.isRequired,
  setArchive: PropTypes.func.isRequired,
};

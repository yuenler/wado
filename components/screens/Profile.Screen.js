/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, Text,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Icon, Avatar } from 'react-native-elements';
import globalStyles from '../GlobalStyles';
import { getUser } from '../../helpers';
import PostComponent from './Post.Component';

let user = {};
export default function ProfileScreen({ navigation }) {
  const [starred, setStarred] = useState([]);
  const [archive, setArchive] = useState([]);
  const [ownPosts, setOwnPosts] = useState([]);
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');

  const objToPosts = (obj, type) => {
    const posts = [];
    Object.keys(obj).forEach((post) => {
      const postID = post;
      firebase.database().ref(`Posts/${postID}`).once('value', (snapshot) => {
        const p = snapshot.val();
        p.id = postID;
        posts.push(p);
        if (posts.length === Object.keys(obj).length) {
          if (type === 'starred') {
            setStarred(posts);
          }
          if (type === 'archive') {
            setArchive(posts);
          }
          if (type === 'ownPosts') {
            setOwnPosts(posts);
          }
        }
      });
    });
  };

  const getData = async () => {
    user = await getUser();
    setPhoto(user.photoURL);
    setName(user.displayName);
    firebase.database().ref(`users/${user.uid}/`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if ('starred' in data) {
          objToPosts(data.starred, 'starred');
        }
        if ('archive' in data) {
          objToPosts(data.archive, 'archive');
        }
        if ('ownPosts' in data) {
          objToPosts(data.ownPosts, 'ownPosts');
        }
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
      <ScrollView>
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
        </View>

        <Text style={globalStyles.text}>Starred</Text>
        {
          starred.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
        <Text style={globalStyles.text}>Own Posts</Text>
        {
          ownPosts.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
        <Text style={globalStyles.text}>Archive</Text>
        {
          archive.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
      </ScrollView>
    </View>
  );
}

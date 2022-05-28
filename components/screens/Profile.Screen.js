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
  const [interested, setInterested] = useState([]);
  const [uninterested, setUninterested] = useState([]);
  const [ownPosts, setOwnPosts] = useState([]);
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState('');

  const objToPosts = (obj, type) => {
    const posts = [];
    const ids = [];
    Object.values(obj).forEach((post) => {
      const { postID } = post;
      if (!ids.includes(postID)) {
        ids.push(postID);
        firebase.database().ref(`Posts/${postID}`).once('value', (snapshot) => {
          const p = snapshot.val();
          p.id = postID;
          posts.push(p);
          if (type === 'interested') {
            setInterested(posts);
          }
          if (type === 'uninterested') {
            setUninterested(posts);
          }
          if (type === 'ownPosts') {
            // console.log(posts);
            setOwnPosts(posts);
          }
        });
      }
    });
  };

  const getData = async () => {
    user = await getUser();
    setPhoto(user.photoURL);
    setName(user.displayName);
    firebase.database().ref(`users/${user.uid}/`).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if ('interested' in data) {
          objToPosts(data.interested, 'interested');
        }
        if ('uninterested' in data) {
          objToPosts(data.uninterested, 'uninterested');
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

        <Text style={globalStyles.text}>Interested</Text>
        {
          interested.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
        <Text style={globalStyles.text}>Own Posts</Text>
        {
          ownPosts.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
        <Text style={globalStyles.text}>Uninterested</Text>
        {
          uninterested.map(
            (post) => <PostComponent key={post.id} post={post} navigation={navigation} />,
          )
        }
      </ScrollView>
    </View>
  );
}

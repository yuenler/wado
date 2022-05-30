/* eslint-disable no-restricted-syntax */
/* eslint-disable react/prop-types */
import React from 'react';
import {
  ScrollView, View,
} from 'react-native';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Button } from '@rneui/base';
import { SearchBar } from 'react-native-elements';
import globalStyles from '../GlobalStyles';
import SwipeableComponent from './Swipeable.Component';
import { isSearchSubstring } from '../../helpers';

let allPosts = [];

export default class PostsScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      search: '',
    };
  }

  componentDidMount() {
    firebase.database().ref('Posts')
      .orderByChild('end')
      .startAt(new Date().getTime())
      .limitToFirst(10)
      .once('value', (snapshot) => {
        const p = [];
        snapshot.forEach((childSnapshot) => {
          const post = childSnapshot.val();
          post.id = childSnapshot.key;
          p.push(post);
        });
        allPosts = p;
        this.setState({ posts: p });
      });
  }

  updateSearch(search) {
    this.setState({ search });
    const filteredPosts = [];
    const s = search.trim();
    for (const post of allPosts) {
      if (
        search === ''
        || isSearchSubstring(post.author, s)
        || isSearchSubstring(post.category, s)
        || isSearchSubstring(post.locationDescription, s)
        || isSearchSubstring(post.title, s
          || isSearchSubstring(post.post, s))) {
        filteredPosts.push(post);
      }
    }
    this.setState({ posts: filteredPosts });
  }

  render() {
    const { posts, search } = this.state;
    const { navigation } = this.props;
    return (
      <View style={globalStyles.container}>

        <SearchBar
          lightTheme
          placeholder="Type Here..."
          onChangeText={(value) => this.updateSearch(value)}
          value={search}
        />

        <ScrollView>
          {
            posts.map((post) => (
              <SwipeableComponent
                key={post.id}
                post={post}
                navigation={navigation}

              />

            ))
          }
        </ScrollView>
        <View style={{ alignItems: 'flex-end', margin: 20 }}>
          <Button
            containerStyle={{
              borderRadius: 10,
            }}
            buttonStyle={{
              padding: 15,
              paddingHorizontal: 20,
            }}
            icon={{
              name: 'plus',
              type: 'ant-design',
              color: 'white',
              size: 20,
            }}
            title="Create post"
            onPress={() => navigation.navigate('Create Post', { post: {} })}
            name="plus"
          />

        </View>

      </View>
    );
  }
}

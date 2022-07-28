/* eslint-disable no-restricted-syntax */
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Alert } from 'react-native';
import {Post} from './types/Post';


export function formatDate(time: Date) {
  const dd = String(time.getDate()).padStart(2, '0');
  const mm = String(time.getMonth() + 1).padStart(2, '0');
  const yyyy = time.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

export function formatDateWithMonthName(time: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(time);
  const current = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const month = months[d.getMonth()];
  if ((current.getFullYear() === yyyy && d.getMonth() >= current.getMonth())
    || (current.getFullYear() + 1 === yyyy && d.getMonth() < current.getMonth())) {
    return `${month} ${dd}`;
  }
  return formatDate(d);
}

export function formatTime(time: Date) {

  let hh = time.getHours();
  let min = time.getMinutes();
  let minString = min.toString();
  let ampm = 'AM';
  if (hh >= 12) {
    hh -= 12;
    ampm = 'PM';
  }
  if (hh === 0) {
    hh = 12;
  }
  if (min < 10) {
    minString = `0${min}`;
  }
  return `${hh}:${minString} ${ampm}`;
}

export const determineDatetime = (start: number, end: number) => {
  const currentDate = new Date();
  let datetime = '';
  let startStatus = 0;
  if (currentDate.getTime() < start) {
    if (currentDate.getDate() === new Date(start).getDate()) {
      datetime = `Starts ${formatTime(new Date(start))}`;
    } else {
      datetime = `Starts ${formatDateWithMonthName(start)}`;
    }
  } else if (currentDate.getTime() <= end) {
    startStatus = 1;
    if (currentDate.getDate() === new Date(end).getDate()) {
      datetime = `Ends ${formatTime(new Date(end))}`;
    } else {
      datetime = `Ends ${formatDateWithMonthName(end)}`;
    }
  } else {
    startStatus = 2;
    datetime = 'Ended';
  }
  return { datetime, startStatus };
};

export async function storeData(key: string, value: any) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    Alert.alert('Error', 'Error storing data');
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem('@user');
  } catch (e) {
    Alert.alert('Error', 'Error removing user');
  }
}

export async function getData(key: string) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    Alert.alert('Error', 'There was an error retrieving your data');
  }
  return null;
}

export const isSearchSubstring = (string: string, substring: string) => {
  const indexes = [-1];

  for (let index = 0; index < string.length; index += 1) {
    if (string[index] === ' ') {
      indexes.push(index);
    }
  }

  for (const index of indexes) {
    if (string.toLowerCase().startsWith(substring.toLowerCase(), index + 1)) {
      return true;
    }
  }
  return false;
};

export const filterToUpcomingUnarchivedPosts = async (upcomingPosts: Post[]) => {
  let upcomingUnarchivedPosts = [...upcomingPosts];
  await firebase.database().ref(`users/${global.user.uid}/`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();

      if ('starred' in data) {
        const { starred } = data;
        global.starred = upcomingUnarchivedPosts.filter(
          (post) => (post.id in starred),
        );
        upcomingUnarchivedPosts.forEach((post, i) => {
          let isStarred = false;
          if (global.starred.some((starredPost) => starredPost.id === post.id)) {
            isStarred = true;
          }
          upcomingUnarchivedPosts[i] = { ...post, isStarred };
        });
        // for each post in global.starred, add the attribute isStarred to the post
        global.starred.forEach((post, i) => {
          global.starred[i] = { ...post, isStarred: true };
        });
      } else {
        upcomingUnarchivedPosts.forEach((post, i) => {
          upcomingUnarchivedPosts[i] = { ...post, isStarred: false };
        });
      }

      if ('archive' in data) {
        const { archive } = data;
        upcomingUnarchivedPosts = upcomingUnarchivedPosts.filter(
          (post) => !(post.id in archive),
        );
        global.archive = upcomingPosts.filter(
          (post) => (post.id in archive),
        );
      } else {
        global.archive = [];
      }

      if ('ownPosts' in data) {
        const { ownPosts } = data;
        global.ownPosts = upcomingUnarchivedPosts.filter(
          (post) => (post.id in ownPosts),
        );
      }
    }
  });
  global.posts = upcomingUnarchivedPosts;
};

export const filterToUpcomingPosts = async (posts: Post[]) => {
  const now = Date.now();
  let upcomingPosts = [...posts];
  upcomingPosts = posts.filter((post) => post.end > now);
  // want to store the posts that are not sorted by end date so that they remain sorted by timestamp
  storeData('@posts', upcomingPosts);
  upcomingPosts.sort((a, b) => a.end - b.end);
  // for each post, set the printed date by calling determineDatetime
  upcomingPosts.forEach((post, i) => {
    const datetimeStatus = determineDatetime(post.start, post.end);
    upcomingPosts[i] = { ...post, datetimeStatus };
  });
  await filterToUpcomingUnarchivedPosts(upcomingPosts);
};

export const loadNewPosts = async (posts: Post[], lastEditedTimestamp: number) => {
  const oldAndNewPosts = [...posts];
  await firebase.database().ref('Posts')
    .orderByChild('lastEditedTimestamp')
    .startAfter(lastEditedTimestamp)
    .once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        post.id = childSnapshot.key;
        // check if id is in posts array
        const index = oldAndNewPosts.findIndex((p) => p.id === post.id);
        if (index === -1) {
          // if not found, add to array
          oldAndNewPosts.push(post);
        } else {
          // if it is, update the array
          oldAndNewPosts[index] = post;
        }
      });
    });
    await filterToUpcomingPosts(oldAndNewPosts);
};

export const loadCachedPosts = async () => {
  global.user = await getData('@user');
  const posts: Post[] = await getData('@posts');
  if (posts !== null && posts.length > 0) {
    await loadNewPosts(posts, posts[posts.length - 1].lastEditedTimestamp);
  } else {
    await loadNewPosts([], 0);
  }
};

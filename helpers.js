/* eslint-disable no-restricted-syntax */
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Alert } from 'react-native';

export function formatDate(time) {
  const d = new Date(time);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

export function formatDateWithMonthName(time) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const d = new Date(time);
  const current = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  const month = months[d.getMonth()];
  if ((current.getFullYear() === yyyy && d.getMonth() >= current.getMonth())
    || (current.getFullYear() + 1 === yyyy && d.getMonth < current.getMonth())) {
    return `${month} ${dd}`;
  }
  return formatDate(time);
}

export function formatTime(time) {
  const d = new Date(time);

  let hh = d.getHours();
  let min = d.getMinutes();
  let ampm = 'AM';
  if (hh >= 12) {
    hh -= 12;
    ampm = 'PM';
  }
  if (hh === 0) {
    hh = 12;
  }
  if (min < 10) {
    min = `0${min}`;
  }
  return `${hh}:${min} ${ampm}`;
}

export const determineDatetime = (start, end) => {
  const currentDate = new Date();
  let datetime = '';
  let startStatus = 0;
  if (currentDate.getTime() < start) {
    if (currentDate.getDate() === new Date(start).getDate()) {
      datetime = `Starts ${formatTime(start)}`;
    } else {
      datetime = `Starts ${formatDateWithMonthName(start)}`;
    }
  } else if (currentDate.getTime() <= end) {
    startStatus = 1;
    if (currentDate.getDate() === new Date(end).getDate()) {
      datetime = `Ends ${formatTime(end)}`;
    } else {
      datetime = `Ends ${formatDateWithMonthName(end)}`;
    }
  } else {
    startStatus = 2;
    datetime = 'Ended';
  }
  return { datetime, startStatus };
};

export async function storeData(key, value) {
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

export async function getData(key) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    Alert.alert('Error', 'There was an error retrieving your data');
  }
  return null;
}

export const isSearchSubstring = (string, substring) => {
  const indexes = [-1];

  for (let index = 0; index < string.length; index += 1) {
    if (string[index] === ' ') {
      indexes.push(index);
    }
  }

  for (const index of indexes) {
    if (string.startsWith(substring, index + 1)) {
      return true;
    }
  }
  return false;
};

export const filterToUpcomingUnarchivedPosts = async () => {
  await firebase.database().ref(`users/${global.user.uid}/`).once('value', (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      if ('archive' in data) {
        const { archive } = data;
        global.upcomingUnarchivedPosts = global.upcomingPosts.filter(
          (post) => !(post.id in archive),
        );
        global.archive = global.upcomingPosts.filter(
          (post) => (post.id in archive),
        );
      } else {
        global.upcomingUnarchivedPosts = global.upcomingPosts;
        global.archive = [];
      }

      if ('starred' in data) {
        const { starred } = data;
        global.starred = global.upcomingPosts.filter(
          (post) => (post.id in starred),
        );
      }
      if ('ownPosts' in data) {
        const { ownPosts } = data;
        global.ownPosts = global.upcomingPosts.filter(
          (post) => (post.id in ownPosts),
        );
      }
    }
  });
};

export const filterToUpcomingPosts = () => {
  const now = Date.now();
  global.upcomingPosts = global.posts.filter((post) => post.end > now);
  // want to store the posts that are not sorted by end date so that they remain sorted by timestamp
  storeData('@posts', global.upcomingPosts);
  global.upcomingPosts.sort((a, b) => a.end - b.end);
  // for each post, set the printed date by calling determineDatetime
  global.upcomingPosts.forEach((post, i) => {
    const datetimeStatus = determineDatetime(post.start, post.end);
    let starred = false;
    if (global.starred.some((starredPost) => starredPost.id === post.id)) {
      starred = true;
    }
    global.upcomingPosts[i] = { ...post, datetimeStatus, starred };
  });
};

export const loadNewPosts = async (lastEditedTimestamp) => {
  await firebase.database().ref('Posts')
    .orderByChild('lastEditedTimestamp')
    .startAfter(lastEditedTimestamp)
    .once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        post.id = childSnapshot.key;
        // check if id is in posts array
        const index = global.posts.findIndex((p) => p.id === post.id);
        if (index === -1) {
          // if not found, add to array
          global.posts.push(post);
        } else {
          // if it is, update the array
          global.posts[index] = post;
        }
      });
    });
};

export const loadCachedPosts = async () => {
  global.user = await getData('@user');
  // const posts = await getData('@posts');
  const posts = null;
  if (posts) {
    global.posts = posts;
    await loadNewPosts(posts[posts.length - 1].lastEditedTimestamp);
  } else {
    await loadNewPosts(0);
  }
  await filterToUpcomingPosts();
  await filterToUpcomingUnarchivedPosts();
};

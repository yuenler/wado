/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

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

export async function storeData(key, value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.log(e);
  }
}

export async function removeUser() {
  try {
    await AsyncStorage.removeItem('@user');
  } catch (e) {
    console.log(e);
  }
}

export async function getData(key) {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
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
        const archivedIds = Object.keys(archive);
        global.upcomingUnarchivedPosts = global.upcomingPosts.filter(
          (post) => !(post.id in archivedIds),
        );
        global.archive = global.upcomingPosts.filter(
          (post) => (post.id in archivedIds),
        );
      }
      if ('starred' in data) {
        const { starred } = data;
        const starredIds = Object.keys(starred);
        global.starredIds = starredIds;
        global.starred = global.upcomingPosts.filter(
          (post) => !(post.id in starredIds),
        );
      }
      if ('ownPosts' in data) {
        const { ownPosts } = data;
        const ownPostsIds = Object.keys(ownPosts);
        global.ownPosts = global.upcomingPosts.filter(
          (post) => !(post.id in ownPostsIds),
        );
      }
    }
  });
};

export const filterToUpcomingPosts = () => {
  const now = Date.now();
  global.upcomingPosts = global.posts.filter((post) => post.end > now);
  global.upcomingPosts.sort((a, b) => a.end - b.end);
};

export const loadNewPosts = async (lastEditedTimestamp) => {
  await firebase.database().ref('Posts')
    .orderByChild('lastEditedTimestamp')
    .startAfter(lastEditedTimestamp)
    .once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const post = childSnapshot.val();
        post.id = childSnapshot.key;
        // this if statement accounts for the scenario where someone edits their post
        if (post.id in global.posts) {
          global.posts[post.id] = post;
        } else {
          global.posts.push(post);
        }
      });
      storeData('@posts', global.posts);
    });
};

export const loadCachedPosts = async () => {
  global.user = await getData('@user');
  const posts = await getData('@posts');
  if (posts) {
    global.posts = posts;
    await loadNewPosts(posts[posts.length - 1].lastEditedTimestamp);
  } else {
    await loadNewPosts(0);
  }
  await filterToUpcomingPosts();
  await filterToUpcomingUnarchivedPosts();
};

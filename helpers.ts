/* eslint-disable no-restricted-syntax */
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Post, UserSpecificPost } from './types/Post';

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
  const min = time.getMinutes();
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

export const filterToUpcomingPosts = async (posts: UserSpecificPost[]) => {
  const now = Date.now();
  let upcomingPosts = [...posts];
  upcomingPosts = posts.filter((post) => post.end > now);
  // also filter out posts that are not targeted to the current user
  if (global.house) {
    upcomingPosts = upcomingPosts.filter((post) => (
      !post.targetedHouses || post.targetedHouses.includes(global.house)
      || post.targetedHouses.length === 0
      || post.targetedHouses.length === 13
      || !global.house
      || global.house === 'n/a'
    ));
  }
  if (global.year) {
    upcomingPosts = upcomingPosts.filter((post) => (
      !post.targetedYears || post.targetedYears.includes(global.year)
      || post.targetedYears.length === 0
      || post.targetedHouses.length === 4
      || !global.year
      || global.year === 'n/a'
    ));
  }
  // want to store the posts that are not sorted by end date so that they remain sorted by timestamp
  storeData('@posts', upcomingPosts);
  upcomingPosts.sort((a, b) => a.end - b.end);
  // for each post, set the printed date by calling determineDatetime
  global.posts = upcomingPosts.map((post) => {
    const datetimeStatus = determineDatetime(post.start, post.end);
    return { ...post, datetimeStatus };
  });
};

export const loadNewPosts = async (posts: UserSpecificPost[], lastEditedTimestamp: number) => {
  const oldAndNewPosts = [...posts];
  await firebase.database().ref('Posts')
    .orderByChild('lastEditedTimestamp')
    .startAfter(lastEditedTimestamp)
    .once('value', (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const post: Post = {
          title: childSnapshot.val().title,
          start: childSnapshot.val().start,
          end: childSnapshot.val().end,
          lastEditedTimestamp: childSnapshot.val().lastEditedTimestamp,
          postalAddress: childSnapshot.val().postalAddress,
          locationDescription: childSnapshot.val().locationDescription,
          longitude: childSnapshot.val().longitude,
          latitude: childSnapshot.val().latitude,
          category: childSnapshot.val().category,
          link: childSnapshot.val().link,
          post: childSnapshot.val().post,
          author: childSnapshot.val().author,
          authorID: childSnapshot.val().authorID,
          targetedHouses: childSnapshot.val().targetedHouses,
          targetedYears: childSnapshot.val().targetedYears,
        };
        if (childSnapshot.key) {
          const isOwnPost = post.authorID === global.user.uid;
          const userSpecificPost: UserSpecificPost = {
            ...post,
            id: childSnapshot.key,
            isArchived: false,
            isStarred: false,
            isOwnPost,
          };
          // check if id is in posts array
          const index = oldAndNewPosts.findIndex((p) => p.id === userSpecificPost.id);
          if (index === -1) {
          // if not found, add to array
            oldAndNewPosts.push(userSpecificPost);
          } else {
          // if it is, update the array
            oldAndNewPosts[index] = userSpecificPost;
          }
        }
      });
    });
  await filterToUpcomingPosts(oldAndNewPosts);
};

export const loadCachedPosts = async () => {
  const posts: UserSpecificPost[] = await getData('@posts');
  if (posts !== null && posts.length > 0) {
    await loadNewPosts(posts, posts[posts.length - 1].lastEditedTimestamp);
  } else {
    await loadNewPosts([], 0);
  }
};

export const schedulePushNotification = (title: string, triggerTime: Date)
    : Promise<string> => Notifications.scheduleNotificationAsync({
  content: {
    title,
  },
  trigger: triggerTime,
});

export const cancelScheduledPushNotification = (pushIdentifier: string) => {
  Notifications.cancelScheduledNotificationAsync(pushIdentifier);
};

export const archive = async (postId: string, isArchived: boolean) => {
  const index = global.posts.findIndex((p) => p.id === postId);

  global.posts[index] = { ...global.posts[index], isArchived };
  // set is archived to true/false in AsyncStorage
  getData('@posts').then((storedPosts) => {
    const storedPostsCopy = [...storedPosts];
    if (storedPosts !== null) {
      const i = storedPosts.findIndex((p: UserSpecificPost) => p.id === postId);
      storedPostsCopy[i] = { ...storedPosts[i], isArchived };
      storeData('@posts', storedPostsCopy);
    }
  }).catch(() => Alert.alert('Error', 'Error archiving post'));
};

export const star = async (postId: string, isStarred: boolean) => {
  // find index of starredPostId in global.posts
  const index = global.posts.findIndex((p) => p.id === postId);

  if (isStarred) {
    const thirtyMinutesBefore = new Date(global.posts[index].start - 30 * 60 * 1000);
    const pushIdentifier = await schedulePushNotification(
      global.posts[index].title,
      thirtyMinutesBefore,
    );
    global.posts[index] = { ...global.posts[index], isStarred: true, pushIdentifier };
  } else {
    const post = global.posts[index];
    if (post.isStarred) {
      const { pushIdentifier } = post;
      await cancelScheduledPushNotification(pushIdentifier);
      global.posts[index] = { ...global.posts[index], isStarred: false };
    }
  }
  // set is starred to true/false in AsyncStorage
  getData('@posts').then((storedPosts) => {
    const storedPostsCopy = [...storedPosts];
    if (storedPosts !== null) {
      const i = storedPosts.findIndex((p: UserSpecificPost) => p.id === postId);
      storedPostsCopy[i] = { ...storedPosts[i], isStarred };
      storeData('@posts', storedPostsCopy);
    }
  }).catch(() => Alert.alert('Error', 'Error starring post'));
};

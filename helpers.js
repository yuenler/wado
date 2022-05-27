/* eslint-disable no-console */
import AsyncStorage from '@react-native-async-storage/async-storage';

export function formatDate(time) {
  const d = new Date(time);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0'); // January is 0!
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

export function formatTime(time) {
  const d = new Date(time);

  let hh = d.getHours();
  let min = d.getMinutes();
  const ampm = 'AM';
  if (hh > 12) {
    hh -= 12;
  }
  if (hh === 0) {
    hh = 12;
  }
  if (min < 10) {
    min = `0${min}`;
  }

  return `${hh}:${min} ${ampm}`;
}

export async function storeUser(value) {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem('@user', jsonValue);
  } catch (e) {
    console.log(e);
  }
}

export async function getUser() {
  try {
    const jsonValue = await AsyncStorage.getItem('@user');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
  }
  return null;
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export function formatDate(day) {
    var d = new Date(day)
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = d.getFullYear();

    return mm + '/' + dd + '/' + yyyy;;
}

export function formatTime(day) {
    var d = new Date(day)

    var hh = d.getHours();
    var min = d.getMinutes();
    var ampm = "AM";
    if (hh > 12){
        hh -= 12;
        ampm = "PM";
    }
    if (min < 10){
        min = "0" + min
    }

    return hh + ":" + min + " " + ampm;
}

export async function storeUser (value) {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@user', jsonValue)
    } catch (e) {
      console.log(e)
    }
  }

export async function getUser () {
    try {
        const jsonValue = await AsyncStorage.getItem('@user')
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
        console.log(e);
    }
}
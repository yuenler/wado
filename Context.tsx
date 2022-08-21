/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { getData } from './helpers';
import { LiveUserSpecificPost } from './types/Post';

export const lightColors = {
  background: '#FFFFFF',
  text: '#121212',
  link: 'blue',
  blue: 'blue',
  red: 'red',
  green: 'green',
  middleBackground: '#91d5fa',
  purple: '#a76af7',
};

export const darkColors = {
  background: '#161616',
  text: '#FFFFFF',
  link: '#64d7fa',
  blue: '#64d7fa',
  red: 'pink',
  green: 'lightgreen',
  middleBackground: '#0d2954',
  purple: '#a76af7',
};

export const Context = React.createContext<{
  allPosts: LiveUserSpecificPost[];
  user: any;
  house: string;
  year: string;
  isDark: boolean;
  colors: any;
  userLatitude: number;
  userLongitude: number;
  firstTime: boolean;
  toastPressed: boolean;
  setUser:(user: any) => void;
  setHouse: (house: string) => void;
  setYear: (year: string) => void;
  setScheme: (scheme: string) => void;
  setAllPosts: (allPosts: LiveUserSpecificPost[]) => void;
  setUserLatitude: (userLatitude: number) => void;
  setUserLongitude: (userLongitude: number) => void;
  setFirstTime: (firstTime: boolean) => void;
  setToastPressed: (toastPressed: boolean) => void;
    }>({
      allPosts: [],
      user: {},
      house: '',
      year: '',
      isDark: true,
      colors: darkColors,
      userLatitude: 42.3743935,
      userLongitude: -71.1184378,
      firstTime: true,
      toastPressed: false,
      setScheme: (scheme: any) => {},
      setAllPosts: (allPosts: LiveUserSpecificPost[]) => {},
      setUser: (user: any) => {},
      setHouse: (house: string) => {},
      setYear: (year: string) => {},
      setUserLatitude: (userLatitude: number) => {},
      setUserLongitude: (userLongitude: number) => {},
      setFirstTime: (firstTime: boolean) => {},
      setToastPressed: (toastPressed: boolean) => {},
    });

export const Provider = (props : any) => {
  // get color scheme from async storage
  let colorScheme = Appearance.getColorScheme();

  /*
    * To enable changing the app theme dynamicly in the app (run-time)
    * we're gonna use useState so we can override the default device theme
    */
  const [isDark, setIsDark] = useState(colorScheme !== 'light');
  const [allPosts, setAllPosts] = useState([]);
  const [user, setUser] = useState({});
  const [house, setHouse] = useState('');
  const [year, setYear] = useState('');

  // set default location to be harvard square
  const [userLatitude, setUserLatitude] = useState(42.3743935);
  const [userLongitude, setUserLongitude] = useState(-71.1184378);

  // set default value for first time to be true
  const [firstTime, setFirstTime] = useState(true);

  // set default value for toast pressed to be false
  const [toastPressed, setToastPressed] = useState(false);

  // Listening to changes of device appearance while in run-time
  useEffect(() => {
    getData('@colorScheme').then((scheme) => {
      if (scheme === 'light' || scheme === 'dark') {
        colorScheme = scheme;
      }
      setIsDark(colorScheme !== 'light');
    });
  }, [colorScheme]);

  const values = {
    allPosts,
    user,
    house,
    year,
    isDark,
    colors: isDark ? darkColors : lightColors,
    userLatitude,
    userLongitude,
    firstTime,
    toastPressed,
    setScheme: (scheme: any) => setIsDark(scheme !== 'light'),
    setHouse: (h: string) => setHouse(h),
    setYear: (y: string) => setYear(y),
    setAllPosts: (p: any) => setAllPosts(p),
    setUser: (u: any) => setUser(u),
    setUserLatitude: (l: number) => setUserLatitude(l),
    setUserLongitude: (l: number) => setUserLongitude(l),
    setFirstTime: (f: boolean) => setFirstTime(f),
    setToastPressed: (t: boolean) => setToastPressed(t),
  };

  return (
        <Context.Provider value={values}>
            {props.children}
        </Context.Provider>
  );
};

// Custom hook to get the theme object returns {isDark, colors, setScheme}
export const useTheme = () => React.useContext(Context);

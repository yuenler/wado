import React, { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

export const lightColors = {
  background: '#FFFFFF',
  text: '#121212',
  link: 'blue',
  blue: 'blue',
  red: 'red',
  green: 'green',
  middleBackground: '#5792eb',
};

// Dark theme colors
export const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  link: '#64d7fa',
  blue: '#64d7fa',
  red: 'pink',
  green: 'lightgreen',
  middleBackground: '#0d2954',
};

export const ThemeContext = React.createContext({
  isDark: false,
  colors: lightColors,
  setScheme: () => {},
});

export const ThemeProvider = (props : any) => {
  // Getting the device color theme, this will also work with react-native-web
  // const colorScheme = Appearance.getColorScheme();
  const colorScheme = 'dark';

  /*
    * To enable changing the app theme dynamicly in the app (run-time)
    * we're gonna use useState so we can override the default device theme
    */
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Listening to changes of device appearance while in run-time
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  const defaultTheme = {
    isDark,
    // Chaning color schemes according to theme
    colors: isDark ? darkColors : lightColors,
    // Overrides the isDark value will cause re-render inside the context.
    setScheme: (scheme: any) => setIsDark(scheme === 'dark'),
  };

  return (
        <ThemeContext.Provider value={defaultTheme}>
            {props.children}
        </ThemeContext.Provider>
  );
};

// Custom hook to get the theme object returns {isDark, colors, setScheme}
export const useTheme = () => React.useContext(ThemeContext);
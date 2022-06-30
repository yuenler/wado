import { StyleSheet } from 'react-native';

const globalStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flexDirection: 'column',
    flex: 1,
  },
  centeredContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#871609',
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  buttonText2: {
    fontSize: 20,
    color: '#fff',
    fontFamily: 'Montserrat',
  },
  title: {
    fontSize: 20,
    fontFamily: 'MontserratBold',
  },
  text: {
    fontSize: 15,
    fontFamily: 'Montserrat',
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
  },
  boldText: {
    fontSize: 15,
    fontFamily: 'MontserratBold',
  },
  question: {
    fontSize: 20,
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },

});

export default globalStyles;

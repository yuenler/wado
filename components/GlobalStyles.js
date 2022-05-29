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
  boldText: {
    fontSize: 15,
    fontFamily: 'MontserratBold',
  },
  // editContainer: {
  //   marginLeft: 100,
  //   marginTop: -35,
  // },
  // edit: {
  //   paddingRight: 0,
  // },
  // textLabel: {
  //   color: 'white',
  //   marginLeft: 20,
  // },
  // pfp: {
  //   width: 150,
  //   height: 150,
  //   borderRadius: 100,
  // },
  question: {
    fontSize: 20,
    fontFamily: 'Montserrat',
    textAlign: 'center',
  },

});

export default globalStyles;

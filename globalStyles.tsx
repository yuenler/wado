import { StyleSheet, Dimensions } from 'react-native';

const globalStyles = (colors: any) => StyleSheet.create({
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderWidth: 0.5,
    borderColor: '#fff',
    height: 60,
    borderRadius: 10,
    margin: 5,
    padding: 5,
  },
  loginButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
  },
  loginTitle: {
    fontSize: 40,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: '#000000',
  },
  inputContainer: {
    marginHorizontal: '5%',
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  titleContainer: {
    marginTop: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
    marginBottom: 80,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  image: {
    width: 150,
    height: 150,
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  container: {
    backgroundColor: colors.background,
    flexDirection: 'column',
    flex: 1,
  },
  button: {
    backgroundColor: '#a76af7',
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Montserrat',
  },
  title: {
    fontSize: 20,
    fontFamily: 'MontserratBold',
    color: colors.text,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Montserrat',
    color: colors.text,
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'Montserrat',
    color: colors.text,
  },
  boldText: {
    fontSize: 15,
    fontFamily: 'MontserratBold',
    color: colors.text,
  },
  question: {
    fontSize: 20,
    fontFamily: 'Montserrat',
    textAlign: 'center',
    color: colors.text,
  },
  postalAddress: {
    fontSize: 15,
    fontFamily: 'Montserrat',
    color: colors.text,
  },
});

export default globalStyles;

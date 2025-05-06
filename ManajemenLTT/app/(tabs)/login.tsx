import React from 'react';
import {View,Text,TextInput, TouchableOpacity, StyleSheet, Image, SafeAreaView,} from 'react-native';

const LoginScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <Image
          source={require('@/assets/logo.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>Masuk Akun</Text>
        <Text style={styles.subtitle}>
          Silahkan masukan username dan password{'\n'}yang telah terdaftar
        </Text>
      </View>

      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Masukan Email"
        />
        <TextInput
          style={styles.input}
          placeholder="Masukan Password"
        />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Masuk</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2F8057',
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#2F8057',
  },
  logo: {
    marginTop: 100,
    width: 60,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    color: '#f2f2f2',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
  },
  formSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingTop: 48,
    justifyContent: 'flex-start',
  },
  input: {
    backgroundColor: '#A9CDBB',
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 19,
    marginBottom: 18,
    color: '#000',
  },
  button: {
    backgroundColor: '#2F855A',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 84,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
});

export default LoginScreen;

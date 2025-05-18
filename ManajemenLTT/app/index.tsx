import { router } from 'expo-router';
import React, { Component } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Image,SafeAreaView,} from 'react-native';
import { authService, userService } from "@/services";

class LoginScreen extends Component<{}, { email: string; password: string }> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  handleLogin = async () => {
    const { email, password } = this.state;
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password tidak boleh kosong');
      return;
    }

    try {
      await loginUser(email, password);
      router.replace('/Admin/dashboard');
    } catch (error: any) {
      Alert.alert('Login gagal', error.message);
      console.error('Login error:', error);
    }
  };

  render() {
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
            value={this.state.email}
            onChangeText={(text) => this.setState({ email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Masukan Password"
            secureTextEntry
            value={this.state.password}
            onChangeText={(text) => this.setState({ password: text })}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleLogin}
          >
            <Text style={styles.buttonText}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#40744E',
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#40744E',
  },
  logo: {
    marginTop: 100,
    width: 60,
    height: 80,
    alignItems: 'center',
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Lexend',
    color: '#fff',
  },
  subtitle: {
    fontFamily: 'Lexend',
    color: '#fff',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 12,
    fontWeight: '300',
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
    backgroundColor: '#E0EAB8',
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 19,
    marginBottom: 18,
    fontWeight: '600',
    fontFamily: 'Lexend',
    color: '#014A3F',
  },
  button: {
    backgroundColor: '#40744E',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 84,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Lexend',
    fontSize: 20,
  },
});

export default LoginScreen;

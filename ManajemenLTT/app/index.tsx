// app/index.tsx
import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { loginUser, getCurrentUser } from '@/services/authService';

interface State {
  username: string;
  password: string;
}

export default class LoginScreen extends Component<{}, State> {
  state: State = { username: '', password: '' };

  async componentDidMount() {
    const user = await getCurrentUser();
    if (user) {
      this.redirectByRole(user.role);
    }
  }

  redirectByRole(role: string) {
    switch (role) {
      case 'kepalabpp':
        router.replace('/(tabs)/Kepala/dbkepala');
        break;
      case 'admin':
        router.replace('/Admin/dashboard');
        break;
      case 'penyuluh':
        router.replace('/Penyuluh/homepage');
        break;

      default:
        Alert.alert('Error', 'Role tidak dikenali');
    }
  }

  handleLogin = async () => {
    const { username, password } = this.state;
    if (!username || !password) {
      Alert.alert('Error', 'Username dan password tidak boleh kosong');
      return;
    }

    try {
      const user = await loginUser(username, password);
      this.redirectByRole(user.role);
    } catch (err: any) {
      Alert.alert('Login gagal', err.message);
      console.error('Login error:', err);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

      <View style={styles.container}>
        <View style={styles.topSection}>
          <Image source={require('@/assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Masuk Akun</Text>
          <Text style={styles.subtitle}>
            Silahkan masukan username dan password{'\n'}yang telah terdaftar
          </Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Masukan Username"
            value={this.state.username}
            onChangeText={(text) => this.setState({ username: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Masukan Password"
            secureTextEntry
            value={this.state.password}
            onChangeText={(text) => this.setState({ password: text })}
          />
          <TouchableOpacity style={styles.button} onPress={this.handleLogin}>
            <Text style={styles.buttonText}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  </TouchableWithoutFeedback>
</KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#40744E' },
  topSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#40744E',
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
    fontFamily: 'Lexend4',
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
    textAlign: 'center',
    fontFamily: 'Lexend4',
    fontSize: 20,
  },
});

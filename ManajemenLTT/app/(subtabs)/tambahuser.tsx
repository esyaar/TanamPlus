import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { addUser } from '@/services/userService';

export interface CreateUserProfileData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
}

type State = {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
};

class AddUser extends Component<{}, State> {
  state: State = {
    name: '',
    email: '',
    username: '',
    password: '',
    role: '',
  };

  handleSubmit = async () => {
    const { name, email, username, password, role } = this.state;

      if (
        !name ||
        !email ||
        !username ||
        !password ||
        !role
      ) {
        Alert.alert('Validasi', 'Mohon lengkapi semua data sebelum mengirim.');
        return;
      }

    const payload: CreateUserProfileData = {
      name,
      email,
      username,
      password,
      role,
    };

    try {
      const newId = await addUser(payload);
      console.log('Data LTT berhasil ditambahkan dengan ID:', newId);
      Alert.alert('Sukses', 'Data berhasil ditambahkan!'); 
      

      this.setState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: '',
      });
      router.replace('/Admin/user');
  }
  catch (error) {
  console.error('Gagal menambahkan data user:', error);
   Alert.alert('Error', 'Gagal menambahkan data. Silakan coba lagi nanti.');
   }
  };

  render() {
    const { name, email, username, password, role } = this.state;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.inner}>
              <View style={styles.header}>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Tambah User</Text>
              </View>

              <TextInput
                placeholder="Nama"
                style={styles.inputBox2}
                value={name}
                onChangeText={(text) => this.setState({ name: text })}
              />

              <TextInput
                placeholder="Email"
                style={styles.inputBox2}
                value={email}
                onChangeText={(text) => this.setState({ email: text })}
              />

              <TextInput
                placeholder="Username"
                style={styles.inputBox2}
                value={username}
                onChangeText={(text) => this.setState({ username: text })}
              />

              <TextInput
                placeholder="Password"
                style={styles.inputBox2}
                value={password}
                secureTextEntry
                onChangeText={(text) => this.setState({ password: text })}
              />

              <View style={styles.inputBox}>
                <Picker
                  selectedValue={role}
                  onValueChange={(value) => this.setState({ role: value })}
                >
                  <Picker.Item label="Role" value="" />
                  <Picker.Item label="Penyuluh" value="penyuluh" />
                  <Picker.Item label="Kepala BPP" value="kepalabpp" />
                  <Picker.Item label="Admin" value="admin" />
                </Picker>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={this.handleSubmit}>
                <Text style={styles.submitText}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    );
  }
}

export default AddUser;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#40744E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 5,
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    marginRight: 10,
  },
  inputBox: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    justifyContent: 'center',
    marginBottom: 10,
    width: 345,
    height: 50,
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    paddingLeft: 20,
    marginBottom: 10,
    width: 345,
    height: 50,
  },
  submitButton: {
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 300,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

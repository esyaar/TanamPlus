import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { editUserById, getUserById, UserData } from '@/services/userService';

const EditUser: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [wilayah, setWilayah] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = useLocalSearchParams();
  console.log('ID yang diterima:', id);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        setError('User ID tidak ditemukan.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userData: UserData = await getUserById(id as string);
        console.log('User data:', userData);
        setName(userData.name || '');
        setEmail(userData.email || '');
        setUsername(userData.username || '');
        setRole(userData.role || '');
        setWilayah(userData.wilayah || ''); 
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) {
      Alert.alert('Error', 'User ID is missing for update.');
      return;
    }

    if (!name || !email || !username || !role || (role === 'kepalabpp' && !wilayah)) {
      Alert.alert('Validasi', 'Mohon lengkapi semua data sebelum mengirim.');
      return;
    }

    const updateData: Partial<UserData> = {
      name,
      email,
      username,
      role: role as 'admin' | 'penyuluh' | 'kepalabpp',
      wilayah: role === 'kepalabpp' ? wilayah : '', 
    };

    if (password) {
      updateData.password = password;
    }

    try {
      setLoading(true);
      await editUserById(id as string, updateData);
      Alert.alert('Berhasil', 'Data User Berhasil di Update!');
      router.replace('/Admin/user');
    } catch (err) {
      console.error('Failed to update user:', err);
      Alert.alert('Error', 'Gagal Melakukan Update Data User.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40744E" />
        <Text style={styles.loadingText}>Memuat Data User...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
              <Text style={styles.headerText}>Edit User</Text>
            </View>

            <TextInput
              placeholder="Nama"
              style={styles.inputBox2}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              placeholder="Email"
              style={styles.inputBox2}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Username"
              style={styles.inputBox2}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Enter New Password"
              style={styles.inputBox2}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            <View style={styles.inputBox}>
              <Picker
                selectedValue={role}
                onValueChange={(value) => {
                  console.log('Selected role:', value);
                  setRole(value);
                  setWilayah(''); 
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Role" value="" />
                <Picker.Item label="Penyuluh" value="penyuluh" />
                <Picker.Item label="Kepala BPP" value="kepalabpp" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>

            {role === 'kepalabpp' && (
              <View style={styles.inputBox}>
                <Picker
                  selectedValue={wilayah}
                  onValueChange={(value) => setWilayah(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Kecamatan" value="" />
                  <Picker.Item label="Dempo Selatan" value="Dempo Selatan" />
                  <Picker.Item label="Dempo Tengah" value="Dempo Tengah" />
                  <Picker.Item label="Dempo Utara" value="Dempo Utara" />
                  <Picker.Item label="Pagar Alam Selatan" value="Pagar Alam Selatan" />
                  <Picker.Item label="Pagar Alam Utara" value="Pagar Alam Utara" />
                </Picker>
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditUser;

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
    fontFamily: 'Lexend4',
    fontSize: 16,
  },
  button: {
    marginRight: 10,
  },
  inputBox: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
    height: 50,
    overflow: 'hidden',
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    fontFamily: 'Lexend3',
    paddingLeft: 20,
    marginBottom: 10,
    width: '100%',
    height: 50,
    color: '#333',
  },
  picker: {
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Lexend3',
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontFamily: 'Lexend3',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#40744E',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
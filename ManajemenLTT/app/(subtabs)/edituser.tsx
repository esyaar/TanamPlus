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
  ActivityIndicator, // Import ActivityIndicator for loading state
  Alert, // Import Alert for displaying messages
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { editUserById, getUserById, UserData } from '@/services/userService';

const EditUser: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Note: Password won't be pre-filled for security
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true); // State for loading data
  const [error, setError] = useState<string | null>(null); // State for error messages

  const { id } = useLocalSearchParams(); // Get the user ID from the URL parameters

  // Effect to fetch user data when the component mounts or ID changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) {
        setError('User ID not found.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const userData: UserData = await getUserById(id as string); // Fetch user data by ID
        setName(userData.name);
        setEmail(userData.email);
        setUsername(userData.username);
        setRole(userData.role);
        // Do NOT set password here for security reasons. User will enter new password if needed.
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]); // Re-run effect if 'id' changes

  const handleSubmit = async () => {
    if (!id) {
      Alert.alert('Error', 'User ID is missing for update.');
      return;
    }

    // Prepare data for update. Only include password if it's not empty.
    const updateData: Partial<UserData> = {
      name,
      email,
      username,
      role: role as 'admin' | 'penyuluh' | 'kepalabpp', // Cast role to the correct type
    };

    if (password) {
      updateData.password = password; // Only update password if a new one is entered
    }

    try {
      setLoading(true); // Show loading indicator during submission
      await editUserById(id as string, updateData); // Call the update function
      Alert.alert('Success', 'User data updated successfully!');
      router.replace('/Admin/user'); // Navigate back to the user list
    } catch (err) {
      console.error('Failed to update user:', err);
      Alert.alert('Error', 'Failed to update user data. Please try again.');
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#40744E" />
        <Text style={styles.loadingText}>Loading user data...</Text>
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
              placeholder="Password (Leave blank to keep current)"
              style={styles.inputBox2}
              value={password}
              secureTextEntry
              onChangeText={setPassword}
            />

            <View style={styles.inputBox}>
              <Picker
                selectedValue={role}
                onValueChange={(value) => setRole(value)}
                style={styles.picker} // Apply style to picker
              >
                <Picker.Item label="Select Role" value="" />
                <Picker.Item label="Penyuluh" value="penyuluh" />
                <Picker.Item label="Kepala BPP" value="kepalabpp" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>

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
    fontSize: 18, // Increased font size for better readability
  },
  button: {
    marginRight: 10,
  },
  inputBox: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%', // Use percentage for responsiveness
    height: 50,
    overflow: 'hidden', // Ensure picker content stays within bounds
  },
  inputBox2: {
    backgroundColor: '#9FC2A8',
    borderRadius: 13,
    paddingLeft: 20,
    marginBottom: 10,
    width: '100%', // Use percentage for responsiveness
    height: 50,
    color: '#333', // Darker text color for better contrast
  },
  picker: {
    color: '#333', // Text color for picker items
  },
  submitButton: {
    backgroundColor: '#40744E',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30, // Adjusted margin top to be more dynamic
    width: '100%', // Use percentage for responsiveness
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
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
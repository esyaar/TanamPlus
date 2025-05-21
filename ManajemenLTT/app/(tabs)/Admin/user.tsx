// app/(auth)/admin/user.tsx
import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { db } from '@/services/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  deleteUserById,
  UserData,
  getCurrentUser,
} from '@/services/userService';

interface UserItemProps {
  id: string;
  username: string;
  role: string;
  onDelete: () => void;
  onEdit: () => void;
}

class UserItem extends Component<UserItemProps> {
  showDeleteConfirmation = () => {
    Alert.alert(
      'Hapus Data',
      'Apakah Anda yakin ingin menghapus data ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: this.props.onDelete },
      ]
    );
  };

  render() {
    const { username, role, onEdit } = this.props;
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{username}</Text>
          <Text style={styles.info}>{role}</Text>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={this.showDeleteConfirmation}
            style={styles.iconButton}
          >
            <MaterialIcons name="delete" size={24} color="#6E0202" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Feather name="edit" size={24} color="#21523A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

interface UserState {
  users: UserData[];
}

export default class UserList extends Component<{}, UserState> {
  state: UserState = { users: [] };
  unsubscribe: (() => void) | null = null;

  componentDidMount() {
    const userCollection = collection(db, 'users');
    this.unsubscribe = onSnapshot(
      userCollection,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UserData, 'id'>),
        }));
        this.setState({ users: usersData });
      },
      (error) => {
        console.error('Gagal memuat data user:', error);
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  handleDelete = async (id: string) => {
    try {
      await deleteUserById(id);
      Alert.alert('Sukses', 'User berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus user:', error);
      Alert.alert('Error', 'Gagal menghapus user');
    }
  };

  handleEdit = (user: UserData) => {
    router.push({
      pathname: '/(subtabs)/edituser',
      params: { id: user.id },
    });
  };

  handleAddUser = () => {
    router.push('/(subtabs)/tambahuser');
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Data User</Text>
        </View>

        <TouchableOpacity
          style={styles.addUserButton}
          onPress={this.handleAddUser}
        >
          <Text style={styles.addUserText}>Tambah User</Text>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.body}>
          {this.state.users.map((user) => (
            <UserItem
              key={user.id}
              id={user.id}
              username={user.username}
              role={user.role}
              onDelete={() => this.handleDelete(user.id)}
              onEdit={() => this.handleEdit(user)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#40744E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Lexend',
    fontSize: 25,
    fontWeight: 'bold',
  },
  addUserButton: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addUserText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#A5C8B6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 17, color: '#1A1A1A' },
  info: { fontSize: 11, color: '#333', marginTop: 2 },
  icons: { flexDirection: 'row' },
  iconButton: { paddingHorizontal: 6 },
});

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
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
import LogoutModal from '@/components/ui/modalout';

interface UserItemProps {
  id: string;
  name: string;
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
    const { name, role, onEdit } = this.props;
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{name}</Text>
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

export default class UserList extends Component<{}, {}> {
  state = {
    users: [] as UserData[],
    modalVisible: false,
  };

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

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  confirmLogout = () => {
    router.replace('./index');
    this.setState({ modalVisible: false });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Data User</Text>
          <TouchableOpacity onPress={this.openModal}>
            <Image
              source={require('@/assets/ikon/OUT.png')}
              style={styles.out}
            />
          </TouchableOpacity>
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
              name={user.name}
              role={user.role}
              onDelete={() => this.handleDelete(user.id)}
              onEdit={() => this.handleEdit(user)}
            />
          ))}
        </ScrollView>

        <LogoutModal
          visible={this.state.modalVisible}
          onClose={this.closeModal}
          onConfirm={this.confirmLogout}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#40744E',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Lexend4',
    fontSize: 25,
  },
  out: {
    width: 40,
    height: 40,
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
    fontFamily: 'Lexend4',
    fontSize: 13,
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
  title: { 
    fontSize: 18, 
    color: '#1A1A1A',
    fontFamily: 'Lexend3',
  },
  info: { 
    fontSize: 11, 
    color: '#333',
    marginTop: 2,
    fontFamily: 'Lexend3',
     },
  icons: { 
    flexDirection: 'row' 
  },
  iconButton: { 
    paddingHorizontal: 6 
  },
});

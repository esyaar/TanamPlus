import { collection, getDocs, query, where } from 'firebase/firestore';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { db } from './firebaseConfig';
import { createHashSHA1 } from '@/utils/generator';
import { UserData } from './userService';

const showAlert = (title: string, message: string) => {
  Alert.alert(title, message);
};

export async function loginUser(
  username: string,
  password: string
): Promise<UserData> {
  console.log(createHashSHA1(password));
  
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error('User tidak ditemukan');
  }

  const doc = snap.docs[0];
  const data = doc.data() as Omit<UserData, 'id'> & { role?: string };

  if (data.password !== createHashSHA1(password)) {
   throw new Error('Password salah');
  }

  const user = { id: doc.id, ...data };

  await AsyncStorage.setItem('userData', JSON.stringify(user));

  if (Platform.OS === 'web' && user.role !== 'admin') {
    showAlert('Gagal Login', 'Hanya admin bisa akses via web.');
    throw new Error('Bukan admin');
  }

  return user;
}

export async function logoutUser(): Promise<void> {
  await AsyncStorage.removeItem('userData');
  router.replace('/');
}

export async function getCurrentUser(): Promise<UserData | null> {
  const raw = await AsyncStorage.getItem('userData');
  return raw ? JSON.parse(raw) : null;
}

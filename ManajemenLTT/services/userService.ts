import { db } from '../services/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createHashSHA1 } from '@/utils/generator'; 

export interface UserData {
  id?: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: 'admin' | 'penyuluh' | 'kepalabpp';
  createdAt?: string;
  updatedAt?: string;
}

// Type untuk membuat user baru (tanpa updatedAt)
export type CreateUserProfileData = Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>;

// Type untuk update user (tanpa id dan createdAt)
export type UpdateUserProfileData = Partial<Omit<UserData, 'id' | 'createdAt'>>;

export const addUser = async (data: CreateUserProfileData) => {
  try {
    const hashedPassword = createHashSHA1(data.password);

    const userData = {
      ...data,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'users'), userData);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan user:', error);
    throw error;
  }
};

export const getUserData = (callback: (items: UserData[]) => void) => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: UserData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role,
        username: data.username,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    callback(items);
  });

  return unsubscribe;
};

export const editUserById = async (id: string, data: UpdateUserProfileData) => {
  try {
    const updatedData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (data.password) {
      updatedData.password = createHashSHA1(data.password);
    }

    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error(`Gagal mengedit user dengan ID ${id}:`, error);
    throw error;
  }
};

export const deleteUserById = async (id: string) => {
  try {
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
  } catch (error) {
    console.error(`Gagal menghapus user dengan ID ${id}:`, error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<UserData> => {
  try {
    const userRef = doc(db, 'users', id);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as UserData;
    } else {
      throw new Error('User tidak ditemukan');
    }
  } catch (error) {
    console.error(`Gagal mengambil data user dengan ID ${id}:`, error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (!userDataString) return null;
    return JSON.parse(userDataString) as UserData;
  } catch (error) {
    console.error('Gagal mengambil data user saat ini:', error);
    return null;
  }
};

export const userService = {
  addUser,
  editUserById,
  deleteUserById,
  getUserById,
  getCurrentUser,
};

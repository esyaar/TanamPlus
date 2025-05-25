import { db } from '../services/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  getDoc
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WilayahData {
  id?: string;
  user_id: string;
  penyuluh: string;
  bpp: string;
  kecamatan: string;
  kelurahan: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateWilayah = Omit<WilayahData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWilayah = Partial<Omit<WilayahData, 'id' | 'createdAt'>>;

export const addWilayah = async (data: CreateWilayah): Promise<string> => {
  try {
    const WilayahData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'wilayah'), WilayahData);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan data wilayah:', error);
    throw error;
  }
};

// Fungsi realtime listener untuk fetch data wilayah secara realtime
export const getWilayah = (callback: (items: WilayahData[]) => void) => {
  const q = query(collection(db, 'wilayah'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: WilayahData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        user_id: data.user_id,
        bpp: data.bpp,
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        penyuluh: data.penyuluh,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    callback(items);
  });

  return unsubscribe;
};

// Fungsi fetch data sekali (non-realtime)
export const fetchLttDataOnce = async (): Promise<WilayahData[]> => {
  const q = query(collection(db, 'wilayah'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const items: WilayahData[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    items.push({
      id: doc.id,
      user_id: data.user_id,
      bpp: data.bpp,
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      penyuluh: data.penyuluh,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  return items;
};

export const editWilayahById = async (id: string, data: UpdateWilayah) => {
  try {
    // Jika tanggalLaporan di-update, convert ke Timestamp
    const updatedData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const lttRef = doc(db, 'wilayah', id);
    await updateDoc(lttRef, updatedData);
  } catch (error) {
    console.error(`Gagal melakukan perubahan data wilayah dengan ID ${id}:`, error);
    throw error;
  }
};

export const deleteWilayah = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'wilayah', id));
  } catch (error) {
    console.error('Gagal menghapus data wilayah:', error);
    throw error;
  }
};


export const getwWilayahId = async (id: string): Promise<WilayahData> => {
  try {
    const userRef = doc(db, 'wilayah', id);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as WilayahData;
    } else {
      throw new Error('User tidak ditemukan');
    }
  } catch (error) {
    console.error(`Gagal mengambil data user dengan ID ${id}:`, error);
    throw error;
  }
};

export { db };
export const wilayahService = {
  addWilayah,
  deleteWilayah,
  getwWilayahId,
  editWilayahById
};

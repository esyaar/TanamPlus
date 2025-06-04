import { db } from '../services/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';

export interface WilayahData {
  id?: string;
  user_id: string;
  penyuluh: string[];
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
    const wilayahData = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'wilayah'), wilayahData);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan data wilayah:', error);
    throw error;
  }
};

export const getWilayah = (callback: (items: WilayahData[]) => void): Unsubscribe => {
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
        penyuluh: Array.isArray(data.penyuluh)
          ? data.penyuluh.map((p: any) => (typeof p === 'string' ? p : p.id || ''))
          : [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    callback(items);
  });

  return unsubscribe;
};

export const getWilayahByPenyuluh = (userId: string, callback: (items: WilayahData[]) => void): Unsubscribe => {
  const q = query(collection(db, 'wilayah'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: WilayahData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const penyuluh = Array.isArray(data.penyuluh)
        ? data.penyuluh.map((p: any) => (typeof p === 'string' ? p : p.id || ''))
        : [];
      if (penyuluh.includes(userId)) {
        items.push({
          id: doc.id,
          user_id: data.user_id,
          bpp: data.bpp,
          kecamatan: data.kecamatan,
          kelurahan: data.kelurahan,
          penyuluh,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      }
    });
    callback(items);
  });

  return unsubscribe;
};

export const subscribeToWilayahByPenyuluh = (
  userId: string | null,
  callback: (items: WilayahData[], error?: string) => void
): Unsubscribe => {
  if (!userId) {
    callback([], 'Pengguna tidak terautentikasi. Silakan login kembali.');
    return () => {};
  }

  console.log({ userId });

  const q = query(collection(db, 'wilayah'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (querySnapshot) => {
      const items: WilayahData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log({ data });
        const penyuluh = Array.isArray(data.penyuluh)
          ? data.penyuluh.map((p: any) => (typeof p === 'string' ? p : p.id || ''))
          : [];
        if (penyuluh.includes(userId)) {
          items.push({
            id: doc.id,
            user_id: data.user_id,
            bpp: data.bpp,
            kecamatan: data.kecamatan,
            kelurahan: data.kelurahan,
            penyuluh,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        }
      });
      callback(items);
    },
    (error) => {
      console.error('Gagal mengambil data wilayah:', error);
      callback([], 'Gagal mengambil data wilayah. Silakan coba lagi.');
    }
  );

  return unsubscribe;
};

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
      penyuluh: Array.isArray(data.penyuluh)
        ? data.penyuluh.map((p: any) => (typeof p === 'string' ? p : p.id || ''))
        : [],
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  return items;
};

export const editWilayahById = async (id: string, data: UpdateWilayah) => {
  try {
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

export const getWilayahById = async (id: string): Promise<WilayahData> => {
  try {
    const userRef = doc(db, 'wilayah', id);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        user_id: data.user_id,
        bpp: data.bpp,
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        penyuluh: Array.isArray(data.penyuluh)
          ? data.penyuluh.map((p: any) => (typeof p === 'string' ? p : p.id || ''))
          : [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } else {
      throw new Error('Wilayah tidak ditemukan');
    }
  } catch (error) {
    console.error(`Gagal mengambil data wilayah dengan ID ${id}:`, error);
    throw error;
  }
};

export const wilayahService = {
  addWilayah,
  deleteWilayah,
  getWilayahById,
  editWilayahById,
  getWilayah,
  getWilayahByPenyuluh,
  subscribeToWilayahByPenyuluh,
};
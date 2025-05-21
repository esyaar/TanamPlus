import { db } from '../services/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

export interface LttData {
  id?: string;
  wilayah_id: string;
  bpp: string;
  tanggalLaporan: Date;
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLttData = Omit<LttData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLttData = Partial<Omit<LttData, 'id' | 'createdAt'>>;

export const addLtt = async (data: CreateLttData): Promise<string> => {
  try {
    const lttData = {
      ...data,
      tanggalLaporan: Timestamp.fromDate(data.tanggalLaporan),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'ltt'), lttData);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan data LTT:', error);
    throw error;
  }
};

// Fungsi realtime listener untuk fetch data ltt secara realtime
export const getLttData = (callback: (items: LttData[]) => void) => {
  const q = query(collection(db, 'ltt'), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: LttData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        wilayah_id: data.wilayah_id,
        bpp: data.bpp,
        tanggalLaporan: data.tanggalLaporan.toDate(), // convert Timestamp ke Date
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        komoditas: data.komoditas,
        jenisLahan: data.jenisLahan,
        luasTambahTanam: data.luasTambahTanam,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    callback(items);
  });

  return unsubscribe;
};

export const deleteLttData = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ltt', id));
  } catch (error) {
    console.error('Gagal menghapus data LTT:', error);
    throw error;
  }
};

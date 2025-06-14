import { db } from '../services/firebaseConfig'; // Pastikan path ini benar!
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
  getDoc,
  QueryConstraint,
  where,
} from 'firebase/firestore';


export interface LttData {
  id?: string;
  userId: string; 
  wilayah_id: string;
  bpp: string;
  tanggalLaporan: Date;
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
  createdAt: Date; 
  updatedAt: Date | null; 
}

export type CreateLttData = Omit<LttData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLttData = Partial<Omit<LttData, 'id' | 'createdAt'>>; 

export const addLtt = async (data: CreateLttData): Promise<string> => {
  try {
    const lttDataToSave = {
      ...data,
      tanggalLaporan: Timestamp.fromDate(data.tanggalLaporan),
      createdAt: Timestamp.fromDate(new Date()), // Simpan sebagai Timestamp
      updatedAt: Timestamp.fromDate(new Date()), 
    };

    const docRef = await addDoc(collection(db, 'ltt'), lttDataToSave);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan data LTT:', error);
    throw error;
  }
};

export const getLttData = (
  callback: (items: LttData[]) => void,
  userId?: string // userId opsional untuk filter realtime
) => {
  const queryConstraints: QueryConstraint[] = [];

  if (userId) {
    queryConstraints.push(where('userId', '==', userId));
  }
  queryConstraints.push(orderBy('createdAt', 'desc'));

  const q = query(collection(db, 'ltt'), ...queryConstraints);

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const items: LttData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        userId: data.userId, 
        wilayah_id: data.wilayah_id,
        bpp: data.bpp,
        tanggalLaporan: data.tanggalLaporan.toDate(), 
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        komoditas: data.komoditas,
        jenisLahan: data.jenisLahan,
        luasTambahTanam: data.luasTambahTanam,
        createdAt: data.createdAt.toDate(), 
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, 
      });
    });
    callback(items);
  });

  return unsubscribe;
};

// --- Fungsi fetchLttDataOnce Diperbarui (Sudah benar dari diskusi sebelumnya) ---
export const fetchLttDataOnce = async (userId?: string): Promise<LttData[]> => {
  try {
    const queryConstraints: QueryConstraint[] = [];

    // Jika userId diberikan, tambahkan klausa where
    if (userId) {
      queryConstraints.push(where('userId', '==', userId));
    }

    // Selalu tambahkan klausa orderBy
    queryConstraints.push(orderBy('createdAt', 'desc'));

    const q = query(collection(db, 'ltt'), ...queryConstraints);

    const querySnapshot = await getDocs(q);
    const items: LttData[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      items.push({
        id: doc.id,
        userId: data.userId, // Pastikan ini dibaca dari data Firestore
        wilayah_id: data.wilayah_id,
        bpp: data.bpp,
        tanggalLaporan: data.tanggalLaporan.toDate(), 
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        komoditas: data.komoditas,
        jenisLahan: data.jenisLahan,
        luasTambahTanam: data.luasTambahTanam,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, 
      });
    });

    return items;
  } catch (error) {
    console.error('Gagal memuat data LTT:', error);
    throw new Error('Gagal memuat data LTT. Silakan coba lagi nanti.');
  }
};

export const editLttById = async (id: string, data: UpdateLttData) => {
  try {
    const updatedData: any = {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()), 
    };

    if (data.tanggalLaporan) {
      updatedData.tanggalLaporan = Timestamp.fromDate(data.tanggalLaporan);
    }

    const lttRef = doc(db, 'ltt', id);
    await updateDoc(lttRef, updatedData);
  } catch (error) {
    console.error(`Gagal melakukan perubahan data LTT dengan ID ${id}:`, error);
    throw error;
  }
};

export const fetchLttById = async (id: string): Promise<LttData | null> => {
  const docRef = doc(db, 'ltt', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId, 
      wilayah_id: data.wilayah_id,
      bpp: data.bpp,
      tanggalLaporan: data.tanggalLaporan.toDate(),
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      komoditas: data.komoditas,
      jenisLahan: data.jenisLahan,
      luasTambahTanam: data.luasTambahTanam,
      createdAt: data.createdAt.toDate(), 
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, 
    };
  }
  return null;
};


export const deleteLttData = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ltt', id));
  } catch (error) {
    console.error('Gagal menghapus data LTT:', error);
    throw error;
  }
};

export const fetchLTTByKomoditas = async (komoditas: string) => {

  const snapshot = await getDocs(collection(db, 'ltt'));
  const map: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.komoditas === komoditas) {
      map[data.kecamatan] = (map[data.kecamatan] || 0) + (data.luasTambahTanam || 0);
    }
  });

  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080'];
  const chartData = Object.entries(map).map(([kec, val], i) => ({
    name: kec,
    value: val,
    color: colors[i % colors.length],
  }));

  return chartData;
};

export { db };
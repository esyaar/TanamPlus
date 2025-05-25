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
        tanggalLaporan: data.tanggalLaporan.toDate(),
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

// Fungsi fetch data sekali (non-realtime)
export const fetchLttDataOnce = async (): Promise<LttData[]> => {
  const q = query(collection(db, 'ltt'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const items: LttData[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    items.push({
      id: doc.id,
      wilayah_id: data.wilayah_id,
      bpp: data.bpp,
      tanggalLaporan: data.tanggalLaporan.toDate(),
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      komoditas: data.komoditas,
      jenisLahan: data.jenisLahan,
      luasTambahTanam: data.luasTambahTanam,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  });

  return items;
};

export const editLttById = async (id: string, data: UpdateLttData) => {
  try {
    // Jika tanggalLaporan di-update, convert ke Timestamp
    const updatedData: any = {
      ...data,
      updatedAt: new Date().toISOString(),
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
      wilayah_id: data.wilayah_id,
      bpp: data.bpp,
      tanggalLaporan: data.tanggalLaporan.toDate(),
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      komoditas: data.komoditas,
      jenisLahan: data.jenisLahan,
      luasTambahTanam: data.luasTambahTanam,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
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

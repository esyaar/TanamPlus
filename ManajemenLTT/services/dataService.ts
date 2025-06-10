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

// --- Antarmuka LttData Diperbarui ---
export interface LttData {
  id?: string;
  userId: string; // <-- **PENTING: Tambahkan ini untuk melacak pemilik data**
  wilayah_id: string;
  bpp: string;
  tanggalLaporan: Date;
  kecamatan: string;
  kelurahan: string;
  komoditas: string;
  jenisLahan: string;
  luasTambahTanam: number;
  createdAt: Date; // Mengubah dari 'string' ke 'Date' karena dikonversi dari Timestamp
  updatedAt: Date | null; // Mengubah dari 'string' ke 'Date | null'
}

// Menambahkan userId ke CreateLttData type
export type CreateLttData = Omit<LttData, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLttData = Partial<Omit<LttData, 'id' | 'createdAt'>>; // userId di sini juga bisa di-update jika perlu

// --- Fungsi addLtt Diperbarui ---
// Fungsi ini sekarang menerima 'userId' sebagai bagian dari 'CreateLttData'
export const addLtt = async (data: CreateLttData): Promise<string> => {
  try {
    const lttDataToSave = {
      ...data,
      tanggalLaporan: Timestamp.fromDate(data.tanggalLaporan),
      createdAt: Timestamp.fromDate(new Date()), // Simpan sebagai Timestamp
      updatedAt: Timestamp.fromDate(new Date()), // Simpan sebagai Timestamp
    };

    const docRef = await addDoc(collection(db, 'ltt'), lttDataToSave);
    return docRef.id;
  } catch (error) {
    console.error('Gagal menambahkan data LTT:', error);
    throw error;
  }
};

// --- Fungsi getLttData (Realtime Listener) Diperbarui ---
// Menambahkan opsi filter userId
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
        userId: data.userId, // Pastikan ada di Firestore
        wilayah_id: data.wilayah_id,
        bpp: data.bpp,
        tanggalLaporan: data.tanggalLaporan.toDate(), // Konversi Timestamp ke Date
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        komoditas: data.komoditas,
        jenisLahan: data.jenisLahan,
        luasTambahTanam: data.luasTambahTanam,
        createdAt: data.createdAt.toDate(), // Konversi Timestamp ke Date
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, // Konversi atau null
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
        tanggalLaporan: data.tanggalLaporan.toDate(), // Konversi Firebase Timestamp ke Date
        kecamatan: data.kecamatan,
        kelurahan: data.kelurahan,
        komoditas: data.komoditas,
        jenisLahan: data.jenisLahan,
        luasTambahTanam: data.luasTambahTanam,
        createdAt: data.createdAt.toDate(), // Konversi Firebase Timestamp ke Date
        updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, // Konversi atau null jika tidak ada
      });
    });

    return items;
  } catch (error) {
    console.error('Gagal memuat data LTT:', error);
    throw new Error('Gagal memuat data LTT. Silakan coba lagi nanti.');
  }
};

// --- Fungsi editLttById Diperbarui ---
// Jika userId juga perlu di-update, pastikan ada di UpdateLttData
export const editLttById = async (id: string, data: UpdateLttData) => {
  try {
    const updatedData: any = {
      ...data,
      updatedAt: Timestamp.fromDate(new Date()), // Simpan sebagai Timestamp
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

// --- Fungsi fetchLttById Diperbarui ---
export const fetchLttById = async (id: string): Promise<LttData | null> => {
  const docRef = doc(db, 'ltt', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId, // Pastikan ini dibaca dari data
      wilayah_id: data.wilayah_id,
      bpp: data.bpp,
      tanggalLaporan: data.tanggalLaporan.toDate(),
      kecamatan: data.kecamatan,
      kelurahan: data.kelurahan,
      komoditas: data.komoditas,
      jenisLahan: data.jenisLahan,
      luasTambahTanam: data.luasTambahTanam,
      createdAt: data.createdAt.toDate(), // Konversi Timestamp ke Date
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : null, // Konversi atau null
    };
  }
  return null;
};

// --- Fungsi deleteLttData (Tidak ada perubahan signifikan terkait userId) ---
export const deleteLttData = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ltt', id));
  } catch (error) {
    console.error('Gagal menghapus data LTT:', error);
    throw error;
  }
};

// --- Fungsi fetchLTTByKomoditas Diperbarui (Tidak ada perubahan signifikan terkait userId kecuali data.userId dapat diakses jika diperlukan) ---
export const fetchLTTByKomoditas = async (komoditas: string) => {
  // Jika Anda ingin memfilter berdasarkan user juga di sini, Anda perlu menambahkan parameter userId
  const snapshot = await getDocs(collection(db, 'ltt'));
  const map: Record<string, number> = {};

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.komoditas === komoditas) {
      // Anda bisa menambahkan filter userId di sini juga jika diperlukan, misal:
      // if (data.komoditas === komoditas && data.userId === someSpecificUserId) {
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
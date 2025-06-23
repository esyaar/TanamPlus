import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '@/components/ui/modalout';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { deleteLttData, LttData } from '@/services/dataService';
import { db } from '@/services/firebaseConfig';
import { getCurrentUser } from '@/services/authService'; 
interface RiwayatItemProps {
  jenisKomoditas: string;
  tanggalInput: string;
  onDelete?: () => void;
  onEdit?: () => void;
  editable: boolean;
}

class RiwayatItem extends Component<RiwayatItemProps> {
  showDeleteConfirmation = () => {
    if (this.props.editable && this.props.onDelete) {
      Alert.alert(
        'Hapus Data',
        'Apakah Anda yakin ingin menghapus data ini?',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Hapus', style: 'destructive', onPress: this.props.onDelete },
        ],
      );
    }
  };

  render() {
    const { jenisKomoditas, tanggalInput, onEdit, editable } = this.props;
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{jenisKomoditas}</Text>
          <Text style={styles.date}>{tanggalInput}</Text>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity
            onPress={this.showDeleteConfirmation}
            style={styles.iconButton}
            disabled={!editable}
          >
            <MaterialIcons name="delete" size={24} color={editable ? '#6E0202' : '#aaa'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={editable ? onEdit : undefined} 
            style={styles.iconButton}
            disabled={!editable}
          >
            <Feather name="edit" size={24} color={editable ? '#21523A' : '#aaa'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

interface State {
  modalVisible: boolean;
  ltt: LttData[];
  currentUserId: string | null;
}

export default class History extends Component<{}, State> {
  state: State = {
    modalVisible: false,
    currentUserId: null,
    ltt: [],
  };

  unsubscribe: (() => void) | null = null;

  async componentDidMount() {
    const user = await getCurrentUser(); 
    if (user && user.id) {
      this.setState({ currentUserId: user.id }, () => {
        this.subscribeToLttData();
      });
    } else {
      Alert.alert('Error', 'User ID tidak ditemukan. Harap masuk kembali.');
      router.replace('./index');
    }
  }

  subscribeToLttData = () => {
    const { currentUserId } = this.state;
    if (!currentUserId) return; 

    const lttCollectionRef = collection(db, 'ltt');
    const userLttQuery = query(
      lttCollectionRef,
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc'), 
    );

    this.unsubscribe = onSnapshot(
      userLttQuery,
      (snapshot) => {
        const usersData: LttData[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const tanggalLaporan = data.tanggalLaporan && typeof data.tanggalLaporan.toDate === 'function'
            ? data.tanggalLaporan.toDate()
            : new Date(); 
          const createdAt = data.createdAt && typeof data.createdAt.toDate === 'function'
            ? data.createdAt.toDate()
            : new Date(); 
          const updatedAt = data.updatedAt && typeof data.updatedAt.toDate === 'function'
            ? data.updatedAt.toDate()
            : null;

          return {
            id: doc.id,
            userId: data.userId, 
            wilayah_id: data.wilayah_id,
            bpp: data.bpp,
            tanggalLaporan: tanggalLaporan,
            kecamatan: data.kecamatan,
            kelurahan: data.kelurahan,
            komoditas: data.komoditas,
            jenisLahan: data.jenisLahan,
            luasTambahTanam: data.luasTambahTanam,
            createdAt: createdAt,
            updatedAt: updatedAt,
          } as LttData; 
        });
        this.setState({ ltt: usersData });
      },
      (error) => {
        console.error('Error fetching LTT data:', error);
        Alert.alert('Error', 'Gagal memuat data riwayat dari Firestore.');
      },
    );
  };

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  handleDelete = async (id: string | undefined) => { 
    if (!id) {
      Alert.alert('Error', 'ID data tidak ditemukan.');
      return;
    }
    try {
      await deleteLttData(id);
      Alert.alert('Sukses', 'Data berhasil dihapus.');
    } catch (error) {
      console.error('Error deleting data:', error);
      Alert.alert('Error', 'Gagal menghapus data. Pastikan Anda memiliki izin.'); 
    }
  };

  handleEdit = (item: LttData) => {
    if (!item.id) {
      Alert.alert('Error', 'ID data tidak valid untuk diedit.');
      return;
    }
    router.push({
      pathname: '/(subtabs)/edit',
      params: { id: String(item.id) },
    });
  };

  confirmLogout = () => {
    this.closeModal();
    router.replace('./index'); 
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  getWeekAndYear = (date: Date) => {
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `Minggu ${week}, ${date.getFullYear()}`;
  };

  isEditable = (createdAt: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 14; 
  };

  render() {
    const { ltt, modalVisible } = this.state;

    const groupedByWeek: { [week: string]: LttData[] } = {};
    ltt.filter(item => item.createdAt instanceof Date).forEach((item) => {
      const weekKey = this.getWeekAndYear(item.createdAt); 
      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = [];
      }
      groupedByWeek[weekKey].push(item);
    });

    const sortedWeeks = Object.keys(groupedByWeek).sort((a, b) => {
        const yearA = parseInt(a.split(', ')[1]);
        const yearB = parseInt(b.split(', ')[1]);
        if (yearA !== yearB) return yearB - yearA;

        const weekA = parseInt(a.split(' ')[1].replace(',', ''));
        const weekB = parseInt(b.split(' ')[1].replace(',', ''));
        return weekB - weekA;
    });

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Riwayat</Text>
          <TouchableOpacity onPress={this.openModal}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {ltt.length === 0 ? (
            <View style={styles.nodata}>
              <Image source={require('@/assets/images/kosong.png')} style={styles.kosong} />
              <Text style={styles.emptyText}>Belum ada data :(</Text>
            </View>
          ) : (
            sortedWeeks.map((weekKey) => ( 
              <View key={weekKey}>
                <Text style={{ fontSize: 14, fontFamily: 'Lexend2', marginVertical: 10 }}>
                  {weekKey}
                </Text>
                {groupedByWeek[weekKey].map((item) => {
                  const createdAtDate = item.createdAt instanceof Date ? item.createdAt : new Date();
                  const dateStr = createdAtDate.toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  const editable = this.isEditable(createdAtDate); 

                  return (
                    <RiwayatItem
                      key={item.id}
                      jenisKomoditas={item.komoditas}
                      tanggalInput={dateStr}
                      onDelete={editable ? () => this.handleDelete(item.id) : undefined}
                      onEdit={editable ? () => this.handleEdit(item) : undefined}
                      editable={editable}
                    />
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        <LogoutModal
          visible={modalVisible}
          onClose={this.closeModal}
          onConfirm={this.confirmLogout}
        />
      </View>
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
    marginRight: 10,
  },
  body: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 10,
    fontFamily: 'Lexend2',
    color: '#a1a1a1',
  },
  card: {
    backgroundColor: '#C1DECF',
    padding: 15,
    borderRadius: 13,
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    color: '#1A1A1A',
    fontFamily: 'Lexend4',
  },
  date: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
    fontFamily: 'Lexend3',
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    paddingHorizontal: 6,
  },
  kosong: {
    width: 80,
    height: 80,
    marginTop: 200,
  },
  nodata: {
    alignItems: 'center',
  },
});
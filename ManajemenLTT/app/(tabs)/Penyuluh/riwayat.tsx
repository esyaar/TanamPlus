import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '@/components/ui/modalout';
import { collection, onSnapshot } from 'firebase/firestore';
import { deleteLttData, LttData } from '@/services/dataService';
import { db } from '@/services/firebaseConfig';

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
        ]
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
            <MaterialIcons name="delete" size={24} color={editable ? "#6E0202" : "#aaa"} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={editable ? onEdit : undefined}
            style={styles.iconButton}
            disabled={!editable}
          >
            <Feather name="edit" size={24} color={editable ? "#21523A" : "#aaa"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

interface State {
  modalVisible: boolean;
  ltt: LttData[];
}

export default class History extends Component<{}, State> {
  state: State = {
    modalVisible: false,
    ltt: [],
  };

  unsubscribe: (() => void) | null = null;

  componentDidMount() {
    const userCollection = collection(db, 'ltt');
    this.unsubscribe = onSnapshot(
      userCollection,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<LttData, 'id'>),
        }));
        this.setState({ ltt: usersData });
      },
      (error) => {
        console.error('Gagal memuat data:', error);
        Alert.alert('Error', 'Gagal memuat data dari Firestore.');
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  handleDelete = async (id: string) => {
    try {
      await deleteLttData(id);
      Alert.alert('Sukses', 'Data berhasil dihapus.');
    } catch (error) {
      console.error('Error delete:', error);
      Alert.alert('Error', 'Gagal menghapus data.');
    }
  };

  handleEdit = (item: LttData) => {
    if (!item.id) {
      Alert.alert('Error', 'ID data tidak valid.');
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

  // ✅ Fungsi: Hitung minggu ke berapa dalam tahun
  getWeekAndYear = (dateStr: string) => {
    const date = new Date(dateStr);
    const onejan = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `Minggu ${week}, ${date.getFullYear()}`;
  };

  // ✅ Fungsi: Cek apakah data masih bisa diedit atau tidak
  isEditable = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 14;
  };

  render() {
    const { ltt, modalVisible } = this.state;

    // Kelompokkan berdasarkan minggu
    const groupedByWeek: { [week: string]: LttData[] } = {};
    ltt.forEach((item) => {
      if (!item.createdAt) return;
      const weekKey = this.getWeekAndYear(item.createdAt);
      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = [];
      }
      groupedByWeek[weekKey].push(item);
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
            Object.entries(groupedByWeek).map(([weekKey, items]) => (
              <View key={weekKey}>
                <Text style={{ fontSize: 14, fontFamily: 'Lexend2', marginVertical: 10 }}>
                  {weekKey}
                </Text>
                {items.map((item) => {
                  const createdAt = item.createdAt || '';
                  const dateStr = createdAt ? new Date(createdAt).toLocaleDateString() : 'Tanggal tidak valid';
                  const editable = createdAt ? this.isEditable(createdAt) : false;

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

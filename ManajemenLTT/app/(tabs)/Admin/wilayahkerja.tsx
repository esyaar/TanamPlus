import React, { Component } from 'react';
import { 
  View,
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity, 
  Alert, 
  Image 
} from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '@/components/ui/modalout';
import { db } from '@/services/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import {
  deleteWilayah,
  WilayahData,
  getwWilayahId,
} from '@/services/wilayahService';

interface State {
  wilayah: WilayahData[];
  modalVisible: boolean;
}

type WilayahItemProps = {
  id: string;
  kelurahan: string;
  kecamatan: string;
  onDelete: () => void;
  onEdit: () => void;
};

class WilayahItem extends Component<WilayahItemProps> {
  showDeleteConfirmation = () => {
    Alert.alert(
      'Hapus Data',
      'Apakah Anda yakin ingin menghapus data ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: this.props.onDelete },
      ]
    );
  };

  render() {
    const { kelurahan, kecamatan, onEdit } = this.props;
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{kelurahan}</Text>
          <Text style={styles.info}>{kecamatan}</Text>
        </View>
        <View style={styles.icons}>
          <TouchableOpacity onPress={this.showDeleteConfirmation} style={styles.iconButton}>
            <MaterialIcons name="delete" size={24} color="#6E0202" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Feather name="edit" size={24} color="#21523A" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

export default class Wilayah extends  Component<{}, {}> {
  state = {
    wilayah: [],
    modalVisible: false,
  };

  unsubscribe: (() => void) | null = null;

  componentDidMount() {
    const wilayahCollection = collection(db, 'wilayah');
    this.unsubscribe = onSnapshot(
      wilayahCollection,
      (snapshot) => {
        const wilayahData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<WilayahData, 'id'>),
        }));
        this.setState({ wilayah: wilayahData });
      },
      (error) => {
        console.error('Gagal memuat data wilayah:', error);
      }
    );
  }

  componentWillUnmount() {
    this.unsubscribe?.();
  }

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  handleDelete = async (id: string) => {
    try {
      await deleteWilayah(id);
      Alert.alert('Sukses', 'Wilayah berhasil dihapus');
    } catch (error) {
      console.error('Gagal menghapus Wilayah:', error);
      Alert.alert('Error', 'Gagal menghapus Wilayah');
    }
  };

  handleEdit = (wilayah: WilayahData) => {
    if (!wilayah.id) {
      Alert.alert('Error', 'ID data tidak valid.');
    return;
    }
        console.log('Mengirim ID ke edit:', wilayah.id);
    router.push({
      pathname: '/(subtabs)/editwilayah',
      params: { id: wilayah.id },
    });
  };

  handleAddWilayah = () => {
    router.push('/(subtabs)/tambahwilayah');
  };

  confirmLogout = () => {
    router.replace('./index');
    this.setState({ modalVisible: false });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Wilayah Kerja</Text>
            <TouchableOpacity onPress={this.openModal}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addWilayahButton} onPress={this.handleAddWilayah}>
          <Text style={styles.addWilayahText}>Tambah Wilayah Kerja</Text>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.body}>
         {this.state.wilayah
        .sort((a, b) => a.kecamatan.localeCompare(b.kecamatan)) // sort berdasarkan abjad kecamatan
        .map((wilayah) => (
        <WilayahItem
        key={wilayah.id}
        id={wilayah.id}
        kelurahan={wilayah.kelurahan}
        kecamatan={wilayah.kecamatan}
        onDelete={() => this.handleDelete(wilayah.id)}
        onEdit={() => this.handleEdit(wilayah)}
        />
       ))}
      </ScrollView>

          <LogoutModal
          visible={this.state.modalVisible}
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
  out:{
    width: 40,
    height: 40,
  },
  addWilayahButton: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom:10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addWilayahText: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Lexend4',
  },
  body: {
    paddingTop: 10,
    paddingBottom:20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#A5C8B6',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontFamily: 'Lexend4',
    color: '#1A1A1A',
  },
  info: {
    fontSize: 11,
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
});

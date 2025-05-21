import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '@/components/ui/modalout';
import { onSnapshot } from 'firebase/firestore';
import { getLttData, deleteLttData } from '@/services/dataService';

interface LttData {
  id: string;
  komoditas: string;
  tanggalLaporan: Date;
}

interface State {
  modalVisible: boolean;
  data: LttData[];
}

type RiwayatItemProps = {
  jenisKomoditas: string;
  tanggalInput: string;
  onDelete: () => void;
  onEdit: () => void;
};

class RiwayatItem extends Component<RiwayatItemProps> {
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
    const { jenisKomoditas, tanggalInput, onEdit } = this.props;
    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>{jenisKomoditas}</Text>
          <Text style={styles.date}>{tanggalInput}</Text>
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

class History extends Component<{}, State> {
  unsubscribe: () => void;

  state: State = {
    modalVisible: false,
    data: [],
  };

  componentDidMount() {
    this.unsubscribe = getLttData((items: LttData[]) => {
      this.setState({ data: items });
    });
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
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

  handleEdit = (id: string) => {
    router.push(`/(subtabs)/edit?id=${id}`);
  };

  confirmLogout = () => {
    this.closeModal();
    router.replace('/login');
  };

  openModal = () => this.setState({ modalVisible: true });
  closeModal = () => this.setState({ modalVisible: false });

  renderItem = ({ item }: { item: LttData }) => {
    const date = new Date(item.tanggalLaporan).toLocaleDateString();
    return (
      <RiwayatItem
        jenisKomoditas={item.komoditas}
        tanggalInput={date}
        onDelete={() => this.handleDelete(item.id)}
        onEdit={() => this.handleEdit(item.id)}
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Riwayat</Text>
          <TouchableOpacity onPress={this.openModal}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
          </TouchableOpacity>
        </View>

        <FlatList
          contentContainerStyle={styles.body}
          data={this.state.data}
          keyExtractor={(item) => item.id}
          renderItem={this.renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Belum ada data.</Text>}
        />

        <LogoutModal
          visible={this.state.modalVisible}
          onClose={this.closeModal}
          onConfirm={this.confirmLogout}
        />
      </View>
    );
  }
}

export default History;

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
    fontFamily: 'Lexend',
    fontSize: 25,
    fontWeight: 'bold',
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
    marginTop: 50,
    color: '#666',
  },
  card: {
    backgroundColor: '#C1DECF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#1A1A1A',
  },
  date: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    paddingHorizontal: 6,
  },
});

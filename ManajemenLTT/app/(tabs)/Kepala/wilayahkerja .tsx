import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import LogoutModal from '@/components/ui/modalout';

type WilayahItemProps = {
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

interface State {
  modalVisible: boolean;
}

class Wilayah extends Component<{}, State> {
  [x: string]: any;
  state: State = {
    modalVisible: false,
  };

  openModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  handleDelete = () => {
    console.log('Hapus data');
  };

  handleEdit = () => {
    router.push('/(subtabs)/editwilayah');
  };

  handleAddUser = () => {
    router.push('/(subtabs)/tambahwilayah');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Wilayah Kerja</Text>
            <TouchableOpacity onPress={() => this.setState({ modalVisible: true })}>
            <Image source={require('@/assets/ikon/OUT.png')} style={styles.out} />
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addWilayahButton} onPress={this.handleAddUser}>
          <Text style={styles.addWilayahText}>Tambah Wilayah Kerja</Text>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.body}>
          <WilayahItem kelurahan="Bangun Rejo" kecamatan="Kecamatan Pagaralam Utara" onDelete={this.handleDelete} onEdit={this.handleEdit} />
          <WilayahItem kelurahan="Beringin Jaya" kecamatan="Kecamatan Pagaralam Utara" onDelete={this.handleDelete} onEdit={this.handleEdit} />
        </View>

          {/* Modal Logout */}
          <LogoutModal
          visible={this.state.modalVisible}
          onClose={this.closeModal}
          onConfirm={this.confirmLogout}
          />
      </View>
    );
  }
}

export default Wilayah;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    fontFamily: 'Lexend',
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
  out:{
    width: 40,
    height: 40,
    marginRight:10,
  },
  addWilayahButton: {
    backgroundColor: '#40744E',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addWilayahText: {
    color: 'white',
    fontSize: 13,
  },
  body: {
    padding: 20,
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
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  info: {
    fontSize: 11,
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

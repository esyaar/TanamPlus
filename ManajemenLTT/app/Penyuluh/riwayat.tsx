import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';

type RiwayatItemProps = { //komponen
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

class History extends Component {
  handleDelete = () => {
    console.log('Hapus data');
  };

  handleEdit = () => {
    router.push('/Penyuluh/edit');
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Riwayat</Text>
        </View>

        <View style={styles.body}>
          <RiwayatItem
            jenisKomoditas="Padi Hibridah"
            tanggalInput="05/04/2025"
            onDelete={this.handleDelete}
            onEdit={this.handleEdit}
          />
        </View>
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
  },
  headerText: {
    color: '#fff',
    fontFamily: 'Lexend',
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: 10,
    paddingBottom: 5,
  },
  body: {
    padding: 20,
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

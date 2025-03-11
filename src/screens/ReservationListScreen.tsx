import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert, Modal, Button, Platform } from 'react-native';
import { format, addDays } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Reservation } from '../types';
import { subscribeToReservations, deleteReservation, acceptReservation, rejectReservation } from '../services/ReservationService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { it } from 'date-fns/locale';
type Props = NativeStackScreenProps<any>;

const ReservationListScreen: React.FC<Props> = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToReservations((newReservations) => {
      const filteredReservations = newReservations.filter(
        (res) => res.date === selectedDate
      );
      setReservations(filteredReservations);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleDelete = async (reservation: Reservation) => {
    try {
      if (reservation.id) {
        await deleteReservation(reservation.id);
        showToast('success', 'Prenotazione eliminata con successo');
      }
    } catch (error) {
      showToast('error', 'Errore durante l\'eliminazione');
    }
  };

  const handleAccept = async (reservation: Reservation) => {
    try {
      if (reservation.id) {
        await acceptReservation(reservation.id, reservation);
        showToast('success', 'Prenotazione accettata con successo');
      }
    } catch (error) {
      showToast('error', 'Errore durante l\'accettazione');
    }
  };

  const handleReject = async (reservation: Reservation) => {
    try {
      if (reservation.id) {
        await rejectReservation(reservation.id, reservation);
        showToast('success', 'Prenotazione rifiutata con successo');
      }
    } catch (error) {
      showToast('error', 'Errore durante il rifiuto');
    }
  };

  // Funzione per mostrare un semplice toast utilizzando Alert
  const showToast = (type: 'success' | 'error', message: string) => {
    Alert.alert(
      type === 'success' ? 'Operazione completata' : 'Errore',
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const renderReservation = ({ item: reservation }: { item: Reservation }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{reservation.fullName}</Text>
        <Text style={styles.cardSubtitle}>{reservation.time}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardInfo}>Telefono: {reservation.phone}</Text>
        <Text style={styles.cardInfo}>Email: {reservation.email}</Text>
        <Text style={styles.cardInfo}>Persone: {reservation.seats}</Text>
        {reservation.specialRequests && (
          <Text style={styles.cardInfo}>Note: {reservation.specialRequests}</Text>
        )}
      </View>
      <View style={styles.cardStatus}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(reservation.status) }]} />
        <Text style={styles.statusText}>{getStatusText(reservation.status)}</Text>
      </View>
      <View style={styles.cardActions}>
        {reservation.status === 'pending' && (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={() => handleAccept(reservation)}>
              <MaterialCommunityIcons name="check" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Accetta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleReject(reservation)}>
              <MaterialCommunityIcons name="close" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Rifiuta</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(reservation)}>
          <MaterialCommunityIcons name="delete" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Elimina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return '#388e3c';
      case 'rejected': return '#d32f2f';
      default: return '#f57c00';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted': return 'Confermata';
      case 'rejected': return 'Rifiutata';
      default: return 'In attesa';
    }
  };

  const showDatePicker = () => {
    setDatePickerDate(new Date(`${selectedDate}T00:00:00`));
    if (Platform.OS === 'ios') {
      setDatePickerVisible(true);
    } else {
      setShowAndroidDatePicker(true);
    }
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    hideDatePicker();
    setShowAndroidDatePicker(false);
  };

  const handleQuickDateSelect = (days: number) => {
    const date = addDays(new Date(), days);
    setSelectedDate(format(date, 'yyyy-MM-dd'));
  };

  const ListHeader = () => (
    <View style={styles.header}>
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateButton} onPress={() => handleQuickDateSelect(0)}>
          <Text style={[styles.dateButtonText, selectedDate === format(new Date(), 'yyyy-MM-dd') && styles.activeDateText]}>
            Oggi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => handleQuickDateSelect(1)}>
          <Text style={[styles.dateButtonText, selectedDate === format(addDays(new Date(), 1), 'yyyy-MM-dd') && styles.activeDateText]}>
            Domani
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.customDateButton} onPress={showDatePicker}>
          <MaterialCommunityIcons name="calendar" size={18} color="#e91e63" />
          <Text style={styles.customDateText}>
            {format(new Date(`${selectedDate}T00:00:00`), 'dd/MM/yyyy')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id || `${item.fullName}-${item.time}`}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nessuna prenotazione per questa data</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      
      {/* iOS DatePicker Modal */}
      {Platform.OS === 'ios' && isDatePickerVisible && (
        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={datePickerDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) setDatePickerDate(selectedDate);
                }}
                textColor="#000000"
                accentColor="#d81b60"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={hideDatePicker}
                >
                  <Text style={styles.modalButtonText}>Annulla</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={() => handleConfirm(datePickerDate)}
                >
                  <Text style={styles.modalButtonText}>Conferma</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      
      {/* Android DatePicker */}
      {Platform.OS === 'android' && showAndroidDatePicker && (
        <DateTimePicker
          value={datePickerDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowAndroidDatePicker(false);
            if (selectedDate) {
              handleConfirm(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  dateButtonText: {
    color: '#444',
    fontWeight: '500',
  },
  activeDateText: {
    color: '#d81b60',
    fontWeight: 'bold',
  },
  customDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  customDateText: {
    marginLeft: 4,
    color: '#444',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#191919',
  },
  cardSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#d81b60',
  },
  cardContent: {
    marginBottom: 12,
  },
  cardInfo: {
    fontSize: 14,
    color: '#4d4d4d',
    marginBottom: 4,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  acceptButton: {
    backgroundColor: '#388e3c',
  },
  rejectButton: {
    backgroundColor: '#d32f2f',
  },
  deleteButton: {
    backgroundColor: '#455a64',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#d81b60',
  },
  modalButtonText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ReservationListScreen; 
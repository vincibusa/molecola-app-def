import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Card, Text, Button, Colors } from 'react-native-ui-lib';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Reservation } from '../types';
import { subscribeToReservations, deleteReservation, acceptReservation, rejectReservation } from '../services/ReservationService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<any>;

const ReservationListScreen: React.FC<Props> = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

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
        Toast.show({
          type: 'success',
          text1: 'Prenotazione eliminata con successo',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Errore durante l\'eliminazione',
      });
    }
  };

  const handleAccept = async (reservation: Reservation) => {
    try {
      if (reservation.id) {
        await acceptReservation(reservation.id, reservation);
        Toast.show({
          type: 'success',
          text1: 'Prenotazione accettata',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Errore durante l\'accettazione',
      });
    }
  };

  const handleReject = async (reservation: Reservation) => {
    try {
      if (reservation.id) {
        await rejectReservation(reservation.id, reservation);
        Toast.show({
          type: 'success',
          text1: 'Prenotazione rifiutata',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Errore durante il rifiuto',
      });
    }
  };

  const renderReservation = ({ item: reservation }: { item: Reservation }) => (
    <Card style={styles.card} elevation={2}>
      <View style={styles.cardHeader}>
        <View>
          <Text text60 style={styles.name}>{reservation.fullName}</Text>
          <Text text80 style={styles.contact}>{reservation.phone}</Text>
          <Text text80 style={styles.contact}>{reservation.email}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text
            style={[
              styles.status,
              {
                backgroundColor:
                  reservation.status === 'accepted' ? Colors.green30 :
                  reservation.status === 'rejected' ? Colors.red30 :
                  Colors.yellow30
              }
            ]}
          >
            {reservation.status === 'accepted' ? 'Accettata' :
             reservation.status === 'rejected' ? 'Rifiutata' :
             'In attesa'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={20} color={Colors.grey40} />
          <Text text80 style={styles.detailText}>
            {format(new Date(reservation.date), 'dd/MM/yyyy')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={20} color={Colors.grey40} />
          <Text text80 style={styles.detailText}>{reservation.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account-group" size={20} color={Colors.grey40} />
          <Text text80 style={styles.detailText}>
            {reservation.seats} {reservation.seats === 1 ? 'persona' : 'persone'}
          </Text>
        </View>
      </View>

      {reservation.specialRequests && (
        <View style={styles.notesContainer}>
          <Text text80 style={styles.notesLabel}>Note speciali:</Text>
          <Text text80 style={styles.notes}>{reservation.specialRequests}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {reservation.status === 'pending' && (
          <>
            <Button
              label="Accetta"
              size="small"
              backgroundColor={Colors.green30}
              onPress={() => handleAccept(reservation)}
              style={styles.actionButton}
            />
            <Button
              label="Rifiuta"
              size="small"
              backgroundColor={Colors.red30}
              onPress={() => handleReject(reservation)}
              style={styles.actionButton}
            />
          </>
        )}
        <Button
          label="Elimina"
          size="small"
          backgroundColor={Colors.red30}
          onPress={() => handleDelete(reservation)}
          style={styles.actionButton}
        />
      </View>
    </Card>
  );

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirm = (date: Date) => {
    setSelectedDate(format(date, 'yyyy-MM-dd'));
    hideDatePicker();
  };

  const ListHeader = () => (
    <Card style={styles.header}>
      <Text text60 style={styles.headerTitle}>Seleziona Data</Text>
      
      <TouchableOpacity onPress={showDatePicker} style={styles.dateButton}>
        <View style={styles.dateButtonContent}>
          <MaterialCommunityIcons name="calendar" size={24} color={Colors.blue30} />
          <Text text70 style={styles.dateButtonText}>
            {format(new Date(selectedDate), 'dd/MM/yyyy')}
          </Text>
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        date={new Date(selectedDate)}
      />
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={reservations}
        renderItem={renderReservation}
        keyExtractor={(item) => item.id || ''}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text text70 style={styles.emptyText}>
              Non ci sono prenotazioni per questa data
            </Text>
          </View>
        )}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 8,
    margin: 16,
  },
  headerTitle: {
    marginBottom: 12,
    color: Colors.grey10,
  },
  dateButton: {
    backgroundColor: Colors.grey80,
    padding: 12,
    borderRadius: 8,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    marginLeft: 8,
    color: Colors.blue30,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.grey30,
  },
  card: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contact: {
    color: Colors.grey40,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    color: 'white',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: Colors.grey20,
  },
  notesContainer: {
    backgroundColor: Colors.grey70,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notes: {
    color: Colors.grey20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default ReservationListScreen; 
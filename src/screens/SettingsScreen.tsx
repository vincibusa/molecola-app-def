import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Switch, Colors, Card, Button } from 'react-native-ui-lib';
import { format, addDays } from 'date-fns';
import Toast from 'react-native-toast-message';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Shift, allTimes } from '../types';
import { getShiftsForDate, updateShift, initializeShiftsForDate } from '../services/ReservationService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { scheduleLocalNotification } from '../services/NotificationService';

type Props = NativeStackScreenProps<any>;

const SettingsScreen: React.FC<Props> = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    loadShifts();
  }, [selectedDate]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      let shiftsData = await getShiftsForDate(selectedDate);
      if (shiftsData.length === 0) {
        await initializeShiftsForDate(selectedDate);
        shiftsData = await getShiftsForDate(selectedDate);
      }
      setShifts(shiftsData);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Errore',
        text2: 'Errore nel caricamento dei turni',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShift = async (time: string, currentEnabled: boolean) => {
    try {
      await updateShift(selectedDate, time, { enabled: !currentEnabled });
      await loadShifts();
      Toast.show({
        type: 'success',
        text1: `Turno ${time} ${!currentEnabled ? 'attivato' : 'disattivato'}`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Errore',
        text2: 'Errore nell\'aggiornamento del turno',
      });
    }
  };

  const handleQuickDateSelect = (days: number) => {
    const newDate = addDays(new Date(), days);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

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



  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.dateCard}>
          <Text text60 style={styles.title}>Seleziona Data</Text>
          
          <View style={styles.quickDates}>
            <Button
              label="Oggi"
              size="small"
              backgroundColor={Colors.blue30}
              onPress={() => handleQuickDateSelect(0)}
              style={styles.quickDateButton}
            />
            <Button
              label="Domani"
              size="small"
              backgroundColor={Colors.blue30}
              onPress={() => handleQuickDateSelect(1)}
              style={styles.quickDateButton}
            />
            <Button
              label="Dopodomani"
              size="small"
              backgroundColor={Colors.blue30}
              onPress={() => handleQuickDateSelect(2)}
              style={styles.quickDateButton}
            />
          </View>

          <View style={{ flexDirection: 'row', marginTop: 10 }}>
        
          </View>

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
            locale="it"
            confirmTextIOS="Conferma"  
            cancelTextIOS="Annulla"
            isDarkModeEnabled={false}
            themeVariant="light"
          />
        </Card>

        <Card style={styles.shiftsCard}>
          <Text text70 style={styles.cardTitle}>Turni Disponibili</Text>
          {shifts.map((shift) => (
            <View key={shift.time} style={styles.shiftRow}>
              <Text text70>{shift.time}</Text>
              <Switch
                value={shift.enabled}
                onValueChange={() => handleToggleShift(shift.time, shift.enabled)}
                disabled={loading}
              />
            </View>
          ))}
        </Card>
      </View>
      <Toast />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  dateCard: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    color: Colors.grey10,
  },
  quickDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickDateButton: {
    marginRight: 8,
  },
  dateButton: {
    backgroundColor: Colors.grey80,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  shiftsCard: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
    color: Colors.grey10,
  },
  shiftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
});

export default SettingsScreen; 
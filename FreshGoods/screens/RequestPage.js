// RequestsPage.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {IPADD} from './ipadd'; // Import the IPADD constant
const RequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [driverId, setDriverId] = useState('');

  useEffect(() => {
    const fetchDriverData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDriverId(id);
      if (id) fetchExports(id);
    };
    fetchDriverData();
  }, []);

  const fetchExports = async (id) => {
    try {
      const response = await axios.get(`http://${IPADD}:5000/api/drivers/exports/${id}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching export deals:', error);
    }
  };

  const respondToExport = async (exportId, responseStatus) => {
    try {
      await axios.put(`http://${IPADD}:5000/api/drivers/exports/respond/${exportId}`, {
        response: responseStatus,
      });
      Alert.alert('Success', `Request ${responseStatus}`);
      fetchExports(driverId); // Refresh the list
    } catch (error) {
      console.error('Error responding to export deal:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Product: {item.product}</Text>
            <Text style={styles.text}>Destination: {item.destination}</Text>
            <Text style={styles.text}>Salary: ₹{item.driverSalary}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'green' }]}
                onPress={() => respondToExport(item._id, 'Accepted')}
              >
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'red' }]}
                onPress={() => respondToExport(item._id, 'Rejected')}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
  },
  text: { fontSize: 16, marginBottom: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { padding: 10, borderRadius: 5, width: '48%', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default RequestsPage;

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IPADD } from './ipadd';

export default function CustomerHome() {
  const [user, setUser] = useState(null);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserAndFetchWorks = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) throw new Error('User ID not found in storage');

        const userRes = await axios.get(`http://${IPADD}:5000/api/customers/${userId}`);
        const customer = userRes.data.data;
        setUser(customer);

        const worksRes = await axios.get(`http://${IPADD}:5000/api/customer/matching-works/${userId}`);
        setWorks(worksRes.data.data);
      } catch (err) {
        console.error('Error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndFetchWorks();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Product: {item.exportId?.product}</Text>
      <Text>Destination: {item.exportId?.destination}</Text>
      <Text>Vehicle No: {item.exportId?.vehicleNo}</Text>
      <Text>Status: {item.status}</Text>
      <Text>Driver: {item.driverId?.name || 'N/A'}</Text>
      <Text>Vendor: {item.vendorId?.name || item.vendorId?.businessName}</Text>
      <Text>Vendor Mobile: {item.vendorId?.mobileNo}</Text>
      <Text>Route: {item.workRoute?.join(', ')}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.userSection}>
          <Text style={styles.header}>Welcome, {user.name}!</Text>
          <Text style={styles.subText}>Email: {user.email}</Text>
          <Text style={styles.subText}>Mobile: {user.mobileNo}</Text>
          <Text style={styles.subText}>District: {user.district}</Text>
          <Text style={styles.subText}>State: {user.state}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : works.length === 0 ? (
        <Text style={{ marginTop: 20 }}>No matching works in your district yet.</Text>
      ) : (
        <FlatList
          data={works}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  userSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  header: { fontSize: 22, fontWeight: 'bold', color: '#00796b' },
  subText: { fontSize: 16, color: '#333' },
  card: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
});


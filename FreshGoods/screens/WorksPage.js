import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { IPADD } from './ipadd';

const WorksPage = ({ navigation }) => {
  const [works, setWorks] = useState([]);
  const [driverId, setDriverId] = useState(null);
  const [activeWork, setActiveWork] = useState(null);

  useEffect(() => {
    const fetchDriverData = async () => {
      const id = await AsyncStorage.getItem('userId');
      setDriverId(id);
      if (id) fetchWorks(id);
    };
    fetchDriverData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (driverId) {
        fetchWorks(driverId);
      }
    }, 5000); // Every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [driverId]);

  const fetchWorks = async (id) => {
    try {
      const response = await axios.get(`http://${IPADD}:5000/api/works/${id}`);
      console.log('Works Response:', response.data);

      if (Array.isArray(response.data.works) && response.data.works.length > 0) {
        // Works found
        setWorks(response.data.works);
        setActiveWork(response.data.activeWork || null);
      } else {
        console.log('No direct works found, fetching accepted exports...');
        fetchAcceptedExports(id);
      }
    } catch (error) {
      console.error('Error fetching works:', error);
      // Fallback if `/api/works/:id` fails
      fetchAcceptedExports(id);
    }
  };

 const fetchAcceptedExports = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exports/accepted/${driverId}`);
    const normalized = response.data.map((exp) => ({
      exportId: exp._id,
      driverId: exp.driver,
      vendorId: exp.vendorId,
      deviceId: exp.deviceNo,
      product: exp.product,
      destination: exp.destination,
      startDateTime: exp.startDateTime,
      driverSalary: exp.driverSalary,
      vendor: exp.vendor,
    }));
    setWorks(normalized);
  } catch (error) {
    console.error('Error fetching exports:', error);
  }
};

  const isStartButtonEnabled = (startDate) => {
    const now = new Date();
    return now >= new Date(startDate) && !activeWork;
  };

  const startWork = async (item) => {
  try {
    const workPayload = {
      exportId: item.exportId,
      driverId: item.driverId,
      vendorId: item.vendorId,
      deviceId: item.deviceId,
      product: item.product,
      destination: item.destination,
      startDateTime: item.startDateTime,
      driverSalary: item.driverSalary,
      vendor: item.vendor,
    };

    const response = await axios.post(`${API_BASE_URL}/works/start`, workPayload);

    if (response.status === 201) {
      console.log('Work started successfully:', response.data);
      Alert.alert('Success', 'Work started successfully!');
    } else {
      console.error('Unexpected response status:', response.status);
      Alert.alert('Error', 'Unexpected response from the server.');
    }
  } catch (error) {
    console.error('❌ Error saving work:', error);
    Alert.alert('Error', 'Failed to start work.');
  }
};

  const moveToWork = (workId) => {
    navigation.navigate('WorkDetailsPage', { workId });
  };

  const renderItem = ({ item }) => {
    const exportData = item.exportId || item;
    const vendorData = item.vendorId || item.vendor;

    return (
      <View style={styles.card}>
        <Text style={styles.text}>Product: {exportData?.product}</Text>
        <Text style={styles.text}>Destination: {exportData?.destination}</Text>
        <Text style={styles.text}>Start Date: {new Date(exportData?.startDateTime).toLocaleString()}</Text>
        <Text style={styles.text}>Salary: ₹{exportData?.driverSalary}</Text>
        <Text style={styles.text}>Vendor: {vendorData?.name || 'N/A'}</Text>
        <Text style={styles.text}>Vendor Mobile: {vendorData?.mobileNo || 'N/A'}</Text>

        {activeWork ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'orange' }]}
            onPress={() => moveToWork(activeWork._id)}
          >
            <Text style={styles.buttonText}>
              Move to Ongoing Work ({activeWork.destination})
            </Text>
          </TouchableOpacity>
        ) : isStartButtonEnabled(exportData?.startDateTime) ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'green' }]}
            onPress={() => startWork(item)}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.text}>Cannot start yet</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={works}
        keyExtractor={(item) => item._id || item.exportId?._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No works available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default WorksPage;

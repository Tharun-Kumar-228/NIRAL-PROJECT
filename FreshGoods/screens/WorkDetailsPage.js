import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert, Animated, PanResponder } from 'react-native';
import axios from 'axios';
import { IPADD } from './ipadd';

const { width } = Dimensions.get('window');

const DashboardPage = ({ route, navigation }) => {
  const { workId } = route.params;

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    gasLevel: 0,
  });

  const [workData, setWorkData] = useState({
    workId: '',
    deviceId: '',
    status: '',
    workRoute: [],
    startTime: null,
  });

  const [elapsedTime, setElapsedTime] = useState(null);
  const intervalRef = useRef(null);

  const fetchSensorData = async (deviceId) => {
    try {
      const response = await axios.get(`http://${IPADD}:5000/api/sensor-data/${deviceId}`);
      const latestData = response.data;
      if (latestData) {
        setSensorData({
          temperature: latestData.temperature,
          humidity: latestData.humidity,
          gasLevel: latestData.gasLevel,
          recordedAt: latestData.recorded_at,
        });
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      Alert.alert('Error', 'Failed to fetch sensor data');
    }
  };

  const fetchWorkData = async () => {
    try {
      const workResponse = await axios.get(`http://${IPADD}:5000/api/work/${workId}`);
      const workDetails = workResponse.data;

      const deviceId = workDetails?.deviceId;

      setWorkData({
        workId: workDetails?._id || workId,
        deviceId: deviceId,
        status: workDetails?.status || 'Unknown',
        workRoute: workDetails?.workRoute || [],
        startTime: workDetails?.startTime || null,
      });

      if (deviceId) {
        fetchSensorData(deviceId);
        const id = setInterval(() => fetchSensorData(deviceId), 5000);
        intervalRef.current = id;
      }

      if (workDetails.status === 'Ongoing' && workDetails?.startTime) {
        const start = new Date(workDetails.startTime).getTime();

        const updateElapsed = () => {
          const now = Date.now();
          const elapsed = Math.floor((now - start) / 1000); // in seconds
          setElapsedTime(elapsed);
        };

        updateElapsed(); // Set immediately
        const timer = setInterval(updateElapsed, 1000);
        intervalRef.current = timer;

        return () => clearInterval(timer);
      }

    } catch (error) {
      console.error('Error fetching work data:', error);
      Alert.alert('Error', 'Failed to fetch work data');
    }
  };

  useEffect(() => {
    fetchWorkData();
    return () => clearInterval(intervalRef.current);
  }, [workId]);

  // Swipe gesture
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (evt, gesture) => {
      if (gesture.dx > 100) {
        navigation.navigate('MapPage', { workId }); // Your Map Page name here
      }
    },
  });

  const formatElapsed = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getColor = (value, min, max) => {
    const percentage = (value - min) / (max - min);
    if (percentage <= 0.3) return '#4caf50';
    if (percentage <= 0.7) return '#ffeb3b';
    return '#f44336';
  };

  const SensorCard = ({ title, value, unit, min, max }) => (
    <View style={[styles.sensorCard, { borderLeftColor: getColor(value, min, max) }]}>
      <Text style={styles.sensorTitle}>{title}</Text>
      <Text style={styles.sensorValue}>{value} {unit}</Text>
    </View>
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text style={styles.header}>Sensor Dashboard</Text>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>Swipe right to view the Map</Text>
      </View>

      <View style={styles.workDetailsContainer}>
        <Text style={styles.workDetailsTitle}>Work Details</Text>
        <Text style={styles.workDetail}>Work ID: {workData.workId}</Text>
        <Text style={styles.workDetail}>Device ID: {workData.deviceId}</Text>
        <Text style={styles.workDetail}>Status: {workData.status || 'Unknown'}</Text>
        {workData.status === 'Ongoing' && elapsedTime !== null && (
          <Text style={styles.workDetail}>Time Elapsed: {formatElapsed(elapsedTime)}</Text>
        )}
        <Text style={styles.workDetail}>Route: {workData.workRoute.join(' ➝ ')}</Text>
      </View>

      <View style={styles.sensorContainer}>
        <SensorCard title="Temperature" value={sensorData.temperature} unit="°C" min={0} max={50} />
        <SensorCard title="Humidity" value={sensorData.humidity} unit="%" min={0} max={100} />
        <SensorCard title="Gas Level" value={sensorData.gasLevel} unit="PPM" min={0} max={1000} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    alignSelf: 'center',
  },
  noteBox: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'stretch',
  },
  noteText: {
    color: '#0277bd',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  workDetailsContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    elevation: 2,
  },
  workDetailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  workDetail: {
    fontSize: 16,
    marginVertical: 2,
  },
  sensorContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  sensorCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 6,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sensorValue: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default DashboardPage;

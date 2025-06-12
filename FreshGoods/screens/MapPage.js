import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const OPENCAGE_API_KEY = '6c069aceb85a44089b064e3d2fd9962d';
const ORS_API_KEYS = [
  '5b3ce3597851110001cf62483bea92698c8542d186907fabf996b9cd',
  '5b3ce3597851110001cf624837f784165eab4ac687baa92d0b282c69',
  '5b3ce3597851110001cf6248365b90e339f044d7a213a86d880c0938',
];
let currentKeyIndex = 0;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const MapPage = ({ route }) => {
  const { workId } = route.params || {};
  const [role, setRole] = useState(null);
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState({
    latitude: 11.6643,
    longitude: 78.146,
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [address, setAddress] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Fetching route...');
  const [instructions, setInstructions] = useState([]);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0);
  const [districts, setDistricts] = useState([]);

  const mapRef = useRef(null);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        setRole(storedRole || 'driver');
      } catch (err) {
        console.error('Failed to fetch role from storage:', err);
      }
    };
    getUserRole();
  }, []);

  const fetchDestination = async () => {
    try {
      const res = await axios.get(
        `http://192.168.214.187:5000/api/work/${workId}`
      );
      const destinationLocation = res.data.destinationLocation;
      console.log('Destination Location:', destinationLocation);
      setDestination({
        latitude: destinationLocation.latitude,
        longitude: destinationLocation.longitude,
      });

      fetchRoute(location, destinationLocation);
    } catch (err) {
      console.error('Failed to fetch destination:', err);
      setStatusMessage('Error fetching destination.');
    }
  };

  const fetchRoute = async (from, to) => {
    currentKeyIndex = (currentKeyIndex + 1) % ORS_API_KEYS.length;
    const key = ORS_API_KEYS[currentKeyIndex];

    try {
      setStatusMessage(`Fetching route with key ${currentKeyIndex + 1}...`);
      const res = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
          coordinates: [
            [from.longitude, from.latitude],
            [to.longitude, to.latitude],
          ],
        },
        {
          headers: {
            Authorization: key,
            'Content-Type': 'application/json',
          },
        }
      );

      const coords = res.data.features[0].geometry.coordinates.map(
        ([lng, lat]) => ({
          latitude: lat,
          longitude: lng,
        })
      );

      const steps = res.data.features[0].properties.segments[0].steps;
      const turnInstructions = steps.map(
        (step) => `${step.instruction} in ${step.distance.toFixed(0)} meters`
      );
      setInstructions(turnInstructions.slice(0, 5));

      setRouteCoords(coords);
      setStatusMessage('Route updated.');
    } catch (err) {
      console.error(`Route error:`, err.message);
      setStatusMessage(`Error fetching route.`);
    }

    await delay(3000);
  };

  const getLocationAndRoute = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Location services are required.');
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const currentLoc = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setLocation(currentLoc);
      fetchDestination();

      if (mapRef.current) {
        mapRef.current.animateToRegion(currentLoc, 1000);
      }
    } catch (err) {
      console.error('Location fetch error:', err);
    }
  };

  const showNextInstruction = () => {
    if (currentInstructionIndex < instructions.length) {
      setCurrentInstructionIndex(currentInstructionIndex + 1);
    }
  };

  useEffect(() => {
    getLocationAndRoute();
  }, []);

  useEffect(() => {
    if (
      instructions.length > 0 &&
      currentInstructionIndex < instructions.length
    ) {
      const timer = setTimeout(showNextInstruction, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentInstructionIndex, instructions]);

  const fetchDistrictsFromMapCenter = async () => {
    if (!mapRef.current || !routeCoords.length) return;

    const region = mapRef.current.__lastRegion || location;
    const { latitude, longitude } = region;

    // Convert [ { lat, lng } ] -> [ [lat, lng] ]
    const routeArray = routeCoords.map(coord => [coord.latitude, coord.longitude]);

    try {
      setStatusMessage('Sending route and fetching districts...');
      
      // Send route
      await axios.post('http://192.168.214.187:5000/api/route/store', {
        source: [location.latitude, location.longitude],
        destination: [destination.latitude, destination.longitude],
        route: routeArray,
        workId,
      });

      // Fetch districts
      const res = await axios.get(`http://192.168.214.187:5000/api/route/districts`, {
        params: { latitude, longitude },
      });

      if (res.data?.districts) {
        setDistricts(res.data.districts);
        setStatusMessage('Route and districts updated.');
      } else {
        setStatusMessage('No districts found.');
      }
    } catch (err) {
      console.error('Error:', err.message);
      setStatusMessage('Failed to update route or fetch districts.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Map View - {role === 'vendor' ? 'Vendor' : 'Driver'}
      </Text>
      {address && <Text style={styles.addressText}>📍 {address}</Text>}
      {statusMessage && <Text style={styles.status}>{statusMessage}</Text>}

      {currentInstructionIndex < instructions.length && (
        <View style={styles.instructionNotification}>
          <Text style={styles.instructionText}>
            🧭 {instructions[currentInstructionIndex]}
          </Text>
        </View>
      )}

      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={location}
          showsUserLocation
          scrollEnabled={true}
          zoomEnabled={true}
        >
          <Marker coordinate={location} title="You are here" />
          <Marker coordinate={destination} pinColor="red" title="Destination" />
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="blue" />
          )}
        </MapView>
      ) : (
        <View style={styles.vendorPlaceholder}>
          <Text style={{ fontSize: 16 }}>
            {role === 'vendor'
              ? 'Vendor can interact with the map.'
              : 'Waiting for location...'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.updateButton}
        onPress={fetchDistrictsFromMapCenter}
      >
        <Text style={styles.refreshText}>📍 Update Route & Fetch Districts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={getLocationAndRoute}>
        <Text style={styles.refreshText}>🔄 Refresh & Recenter</Text>
      </TouchableOpacity>

      {districts.length > 0 && (
        <View style={styles.districtContainer}>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Nearby Districts:</Text>
          {districts.map((d, idx) => (
            <Text key={idx} style={{ fontSize: 14 }}>• {d}</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginBottom: 6,
  },
  status: {
    fontSize: 13,
    textAlign: 'center',
    color: '#888',
    marginBottom: 4,
  },
  instructionNotification: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#1976D2',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
  },
  vendorPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButton: {
    backgroundColor: '#1976D2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  refreshText: {
    color: '#fff',
    fontSize: 16,
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 5,
  },
  districtContainer: {
    padding: 10,
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});

export default MapPage;

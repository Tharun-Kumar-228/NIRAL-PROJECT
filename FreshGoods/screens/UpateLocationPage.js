import React, { useState } from 'react';
import {
  View,
  Button,
  Alert,
  TextInput,
  StyleSheet,
  Keyboard,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { IPADD } from './ipadd'; // Your IP address constant

const UpdateLocationMapPage = ({ route, navigation }) => {
  const { workId } = route.params;
  const [location, setLocation] = useState({
    latitude: 10.0,
    longitude: 77.0,
  });
  const [searchText, setSearchText] = useState('');

  const handleLocationUpdate = async () => {
    try {
      await axios.put(`http://${IPADD}:5000/api/works/update-location/${workId}`, {
        location: location,
      });
      Alert.alert('Location Updated!');
      navigation.goBack();  // Optionally navigate back
    } catch (err) {
      console.error(err);
      Alert.alert('Error updating location');
    }
  };

  const handleLocationSearch = async () => {
    Keyboard.dismiss();
    if (!searchText.trim()) {
      Alert.alert('Please enter a location');
      return;
    }

    try {
      const response = await axios.get(
        'https://api.opencagedata.com/geocode/v1/json',
        {
          params: {
            key: '6c069aceb85a44089b064e3d2fd9962d', // Use your actual OpenCage key
            q: searchText,
            language: 'en',
            limit: 1,
          },
        }
      );

      const results = response.data.results;
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry;
        setLocation({ latitude: lat, longitude: lng });
      } else {
        Alert.alert('Location not found');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      Alert.alert('Failed to search location');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter a place name"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleLocationSearch}
          returnKeyType="search"
        />
        <Button title="Search" onPress={handleLocationSearch} />
      </View>

      {/* Map View */}
      <MapView
        style={{ flex: 1 }}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={(e) => setLocation(e.nativeEvent.coordinate)}
      >
        <Marker coordinate={location} draggable />
      </MapView>

      {/* Update Button */}
      <Button title="Update Location" onPress={handleLocationUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 5,
    zIndex: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    paddingLeft: 8,
    borderRadius: 4,
  },
});

export default UpdateLocationMapPage;

import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import {IPADD} from './ipadd'; // Import the IPADD constant
const backgroundImage = require('../assets/image1.jpg');

const states = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'];
const districts = [
  'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem',
  'Tirunelveli', 'Erode', 'Vellore', 'Tiruppur', 'Thanjavur',
];

export default function SignupScreen() {
  const [selectedRole, setSelectedRole] = useState('Customer');
  const [page, setPage] = useState(1);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');

  const handleNextPage = () => setPage(prev => prev + 1);
  const handlePrevPage = () => setPage(prev => prev - 1);

  const handleSubmit = async () => {
    const formData = {
      role: selectedRole,
      name,
      username,
      email,
      mobile,
      password,
      state: selectedState,
      district: selectedDistrict,
      ...(selectedRole === 'Vendor' && { businessName }),
      ...(selectedRole === 'Driver' && { licenseNo })
    };

    try {
      const response = await axios.post(`http://${IPADD}:5000/api/signup`, formData);
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error submitting form:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" translucent={false} />
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
          <View style={styles.card}>
            {page === 1 && (
              <View style={styles.page}>
                <Text style={styles.title}>Sign Up</Text>
                <View style={styles.roleButtons}>
                  <Button
                    mode={selectedRole === 'Customer' ? 'contained' : 'outlined'}
                    onPress={() => setSelectedRole('Customer')}
                    style={[styles.roleButton, styles.customerButton]}
                  >
                    Customer
                  </Button>
                  <View style={styles.row}>
                    <Button
                      mode={selectedRole === 'Vendor' ? 'contained' : 'outlined'}
                      onPress={() => setSelectedRole('Vendor')}
                      style={[styles.roleButton, styles.vendorDriverButton]}
                    >
                      Vendor
                    </Button>
                    <Button
                      mode={selectedRole === 'Driver' ? 'contained' : 'outlined'}
                      onPress={() => setSelectedRole('Driver')}
                      style={[styles.roleButton, styles.vendorDriverButton]}
                    >
                      Driver
                    </Button>
                  </View>
                </View>
                <Button mode="contained" onPress={handleNextPage} style={styles.nextButton}>
                  Next
                </Button>
              </View>
            )}

            {page === 2 && (
              <ScrollView style={styles.page}>
                <TextInput
                  label="Name"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
                <TextInput
                  label="Username"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter your username"
                />
                <TextInput
                  label="Email"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
                <View style={styles.row}>
                  <Button
                    mode="contained"
                    onPress={handlePrevPage}
                    style={[styles.navButton, styles.halfWidth]}
                  >
                    <Ionicons name="arrow-back" size={18} color="white" /> Prev
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleNextPage}
                    style={[styles.navButton, styles.halfWidth]}
                  >
                    Next <Ionicons name="arrow-forward" size={18} color="white" />
                  </Button>
                </View>
              </ScrollView>
            )}

            {page === 3 && (
              <ScrollView style={styles.page}>
                <TextInput
                  label="Mobile No"
                  style={styles.input}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                />
                <TextInput
                  label="Password"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry
                />
                <View style={styles.input}>
                  <RNPickerSelect
                    onValueChange={(value) => setSelectedState(value)}
                    value={selectedState}
                    placeholder={{ label: 'Select State', value: null }}
                    items={states.map(state => ({ label: state, value: state }))}
                  />
                </View>
                <View style={styles.input}>
                  <RNPickerSelect
                    onValueChange={(value) => setSelectedDistrict(value)}
                    value={selectedDistrict}
                    placeholder={{ label: 'Select District', value: null }}
                    items={districts.map(d => ({ label: d, value: d }))}
                  />
                </View>
                {selectedRole === 'Vendor' && (
                  <TextInput
                    label="Business Name"
                    style={styles.input}
                    value={businessName}
                    onChangeText={setBusinessName}
                    placeholder="Enter your business name"
                  />
                )}
                {selectedRole === 'Driver' && (
                  <TextInput
                    label="License No"
                    style={styles.input}
                    value={licenseNo}
                    onChangeText={setLicenseNo}
                    placeholder="Enter your license number"
                  />
                )}
                <View style={styles.column}>
                  <Button
                    mode="contained"
                    onPress={handlePrevPage}
                    style={[styles.navButton, styles.fullWidth]}
                  >
                    <Ionicons name="arrow-back" size={18} color="white" /> Prev
                  </Button>
                  <Button
                    mode="contained"
                    style={[styles.submitButton, styles.fullWidth]}
                    onPress={handleSubmit}
                  >
                    Submit
                  </Button>
                </View>
              </ScrollView>
            )}
          </View>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width, height },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(20, 20, 20, 0.45)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#dff9fb',
    marginBottom: 20,
    textAlign: 'center',
  },
  roleButtons: { marginBottom: 20, alignItems: 'center' },
  roleButton: { width: '100%', borderRadius: 30, marginBottom: 10 },
  customerButton: { width: '90%' },
  vendorDriverButton: { width: '45%', marginHorizontal: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
  column: { flexDirection: 'column', marginTop: 20 },
  input: { width: '100%', marginBottom: 10 },
  nextButton: { width: '100%', marginTop: 20 },
  navButton: { width: '45%' },
  submitButton: { marginTop: 20 },
  fullWidth: { width: '100%' },
  halfWidth: { width: '45%' },
});

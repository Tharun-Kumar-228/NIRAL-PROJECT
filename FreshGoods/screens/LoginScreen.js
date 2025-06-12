import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPADD } from './ipadd';

const backgroundImage = require('../assets/image1.jpg');

const roles = ['Customer', 'Vendor', 'Driver'];

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('Customer');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password || !selectedRole) {
      Alert.alert('Validation Error', 'Please fill all the fields.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`http://${IPADD}:5000/api/login`, {
        username,
        password,
        role: selectedRole,
      });

      if (response.data.success) {
        const { user } = response.data;
    
        Alert.alert('Login Successful', `Welcome ${user.username}!`);
        Alert.alert('Login Successful', `Welcome ${IPADD}!`);
        // Save user data
        await AsyncStorage.setItem('userId', user._id);
        await AsyncStorage.setItem('role', selectedRole);
    
        // Navigate based on role
        if (selectedRole === 'Vendor') {
            navigation.navigate('VendorHome', { user });
        } else if (selectedRole === 'Customer') {
            navigation.navigate('CustomerHome', { user });
        } else if (selectedRole === 'Driver') {
            navigation.navigate('DriverHome', { user });
        }
    } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" translucent={false} />
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <BlurView intensity={90} tint="dark" style={styles.blurOverlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>

            <View style={styles.inputWrapper}>
              <RNPickerSelect
                onValueChange={(value) => setSelectedRole(value)}
                value={selectedRole}
                placeholder={{ label: 'Select Role', value: null }}
                items={roles.map(role => ({ label: role, value: role }))}
                style={pickerSelectStyles}
              />
            </View>

            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Enter your username"
              mode="outlined"
              theme={{ colors: { text: 'white', placeholder: 'white', primary: '#00cec9' } }}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              placeholder="Enter your password"
              mode="outlined"
              theme={{ colors: { text: 'white', placeholder: 'white', primary: '#00cec9' } }}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgot}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
              loading={loading}
              disabled={loading}
              contentStyle={{ paddingVertical: 8 }}
            >
              Login
            </Button>
          </View>
        </BlurView>
      </ImageBackground>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width,
    height,
  },
  blurOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // slightly darker glass
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#dff9fb',
    marginBottom: 25,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  forgot: {
    color: '#00cec9',
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    borderRadius: 30,
    backgroundColor: '#00cec9',
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#00cec9',
    borderRadius: 8,
    color: 'white',
    paddingRight: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#00cec9',
    borderRadius: 8,
    color: 'white',
    paddingRight: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
};

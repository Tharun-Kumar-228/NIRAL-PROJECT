import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import {IPADD} from './ipadd'; // Import the IPADD constant
const backgroundImage = require('../assets/image1.jpg');

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    // Handle password reset logic here
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" translucent={false} />

      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter your registered email"
              keyboardType="email-address"
            />

            <Button mode="contained" onPress={handleReset} style={styles.resetButton}>
              Send Reset Link
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
    backgroundColor: 'rgba(20, 20, 20, 0.45)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#dff9fb',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginVertical: 10,
  },
  resetButton: {
    marginTop: 20,
    borderRadius: 30,
    paddingVertical: 6,
    width: '100%',
  },
});

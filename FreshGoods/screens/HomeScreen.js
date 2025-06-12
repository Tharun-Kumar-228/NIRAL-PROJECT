import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { Button } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
 // Ensure you have this in your .env file
const backgroundImage = require('../assets/image1.jpg');

export default function HomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            {/* Apply the StatusBar settings */}
            <StatusBar style="light" backgroundColor="#000" translucent={false} />

            <ImageBackground
                source={backgroundImage}
                style={styles.background}
                resizeMode="cover"
            >
                <BlurView intensity={80} tint="dark" style={styles.blurOverlay}>
                    <View style={styles.card}>
                        <Text style={styles.title}>PeriSense</Text>
                        <Text style={styles.subtitle}>Smart Monitoring for Perishables</Text>
                        <Text style={styles.description}>
                            PeriSense uses IoT and AI to track temperature, humidity and gas emissions during storage and transportation.
                            It empowers cold-chain logistics with real-time alerts, reducing waste and preserving food quality.
                        </Text>

                        <View style={styles.buttons}>
                            <Button
                                mode="contained"
                                style={styles.button}
                                buttonColor="#0F4C75"
                                textColor="#fff"
                                onPress={() => navigation.navigate('Login')}
                            >
                                Login
                            </Button>
                            <Button
                                mode="outlined"
                                style={[styles.button, styles.signupButton]}
                                textColor="#fff"
                                labelStyle={{ fontWeight: 'bold' }}
                                onPress={() => navigation.navigate('Signup')}
                            >
                                Signup
                            </Button>
                        </View>
                    </View>
                </BlurView>
            </ImageBackground>
        </View>
    );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
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
        backgroundColor: 'rgba(20, 20, 20, 0.45)', // darker glass effect
        borderRadius: 25,
        padding: 25,
        alignItems: 'center',
        width: '100%',
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#dff9fb', // light blueish
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#a4b0be',
        marginBottom: 20,
    },
    description: {
        fontSize: 15,
        color: '#ced6e0',
        textAlign: 'center', // Justified alignment
        marginBottom: 30,
    },
    buttons: {
        width: '100%',
    },
    button: {
        borderRadius: 30,
        paddingVertical: 6,
        marginVertical: 6,
    },
    signupButton: {
        borderWidth: 1.5,
        borderColor: '#0F4C75',
    },
});

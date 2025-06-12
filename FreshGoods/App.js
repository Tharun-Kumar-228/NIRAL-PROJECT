import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';  // Import PaperProvider
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import { StatusBar } from 'expo-status-bar';  // Import StatusBar for app-wide settings
import CustomerHome from './screens/CustomerHome';
import VendorHome from './screens/VendorHome';  // Your VendorDashboard
import DriverHome from './screens/DriverHome';
import WorkDetailsPage from './screens/WorkDetailsPage'; 
import MapPage from './screens/MapPage';  // Import the MapPage component
import StartRequestPage from './screens/StartRequestPage';
import StartWorkMapPage from './screens/StartWorkMapPage'; 
import UpdateLocationPage from './screens/UpateLocationPage'// Make sure to import the StartRequestPage
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';  // Import gesture handler

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        {/* Set the status bar color globally */}
        <StatusBar style="light" backgroundColor="#1B3A57" translucent={false} />

        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Home', // Set the title of the header
              headerStyle: {
                backgroundColor: '#1B3A57', // Dark navy blue background
              },
              headerTintColor: '#fff', // White text color for the title
            }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="CustomerHome" component={CustomerHome} />
          <Stack.Screen name="VendorHome" component={VendorHome} />
          <Stack.Screen name="DriverHome" component={DriverHome} />
          <Stack.Screen name="WorkDetailsPage" component={WorkDetailsPage} />
          <Stack.Screen name="MapPage" component={MapPage} />
          <Stack.Screen name="StartRequestPage" component={StartRequestPage} />
          <Stack.Screen name="StartWorkMapPage" component={StartWorkMapPage} />
          <Stack.Screen name="UpdateLocationPage" component={UpdateLocationPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

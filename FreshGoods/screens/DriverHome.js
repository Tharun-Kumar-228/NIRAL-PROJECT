import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import RequestsPage from './RequestPage';
import WorksPage from './WorksPage';
import {IPADD} from './ipadd'; // Import the IPADD constant
const Tab = createBottomTabNavigator();

const DriverDashboard = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: 'blue', // Active tab color
        tabBarInactiveTintColor: 'gray', // Inactive tab color
      }}
    >
      <Tab.Screen
        name="Requests"
        component={RequestsPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} /> // Icon for "Requests"
          ),
        }}
      />
      <Tab.Screen
        name="Works"
        component={WorksPage}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} /> // Icon for "Works"
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverDashboard;

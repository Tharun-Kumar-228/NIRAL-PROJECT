import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { IPADD } from './ipadd';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler'; // Import gesture handler

const VendorDashboard = () => {
    const [exportsList, setExportsList] = useState([]);
    const [product, setProduct] = useState('');
    const [destination, setDestination] = useState('');
    const [vehicleNo, setVehicleNo] = useState('');
    const [deviceNo, setDeviceNo] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [driverSalary, setDriverSalary] = useState('');
    const [vendorId, setVendorId] = useState('');
    const [isAddModalVisible, setAddModalVisible] = useState(false);
    const [selectedExport, setSelectedExport] = useState(null);
    const [isViewModalVisible, setViewModalVisible] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            getVendorId();
            fetchDrivers();
        }
    }, [isFocused]);

    const getVendorId = async () => {
        try {
            const id = await AsyncStorage.getItem('userId');
            if (id) {
                setVendorId(id);
                fetchExports(id);
            }
        } catch (error) {
            console.error('Error getting vendorId:', error);
        }
    };

    const fetchExports = async (id) => {
        try {
            const response = await axios.get(`http://${IPADD}:5000/api/vendor/exports?vendorId=${id}`);
            setExportsList(response.data);
        } catch (error) {
            console.error('Error fetching exports:', error);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await axios.get(`http://${IPADD}:5000/api/drivers`);
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const addExport = async () => {
        if (!product || !destination || !vehicleNo || !deviceNo || !selectedDriverId || !driverSalary) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        try {
            await axios.post(`http://${IPADD}:5000/api/vendor/exports`, {
                product,
                destination,
                vehicleNo,
                deviceNo,
                driverId: selectedDriverId,
                driverSalary: parseFloat(driverSalary),
                startDateTime: new Date(),
                deliveryDate: new Date(),
                vendorId,
            });
            Alert.alert('Success', 'Export added successfully');
            setProduct('');
            setDestination('');
            setVehicleNo('');
            setDeviceNo('');
            setDriverSalary('');
            setSelectedDriverId('');
            setAddModalVisible(false);
            fetchExports(vendorId);
        } catch (error) {
            console.error('Error adding export:', error);
            Alert.alert('Error', 'Failed to add export');
        }
    };

    const updateExport = async () => {
        if (!driverSalary || !startDate || !endDate) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        try {
            await axios.put(`http://${IPADD}:5000/api/vendor/exports/${selectedExport._id}`, {
                driverSalary: parseFloat(driverSalary),
                startDateTime: new Date(startDate),
                deliveryDate: new Date(endDate),
            });
            Alert.alert('Success', 'Export updated successfully');
            setViewModalVisible(false);
            fetchExports(vendorId);
        } catch (error) {
            console.error('Error updating export:', error);
            Alert.alert('Error', 'Failed to update export');
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.clear();
            navigation.replace('Login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const renderExportItem = ({ item }) => {
        if (searchQuery && !(
            (item.product && item.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.destination && item.destination.toLowerCase().includes(searchQuery.toLowerCase()))
        )) {
            return null;
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    setSelectedExport(item);
                    setStartDate(item.startDateTime);
                    setEndDate(item.deliveryDate);
                    setDriverSalary(item.driverSalary.toString());
                    setViewModalVisible(true);
                }}
            >
                <Text style={styles.cardTitle}>{item.product}</Text>
                <Text style={styles.cardDetail}>Destination: {item.destination}</Text>
                <Text style={styles.cardDetail}>Vehicle No: {item.vehicleNo}</Text>
                <Text style={styles.cardDetail}>Status: {item.status}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Global Swipeable gesture */}
            <Swipeable
                renderLeftActions={() => (
                    <View style={styles.swipeAction}>
                        <Text style={styles.swipeText}>Swipe to Start Request</Text>
                    </View>
                )}
                onSwipeableLeftOpen={() => navigation.navigate('StartRequestPage')} // Navigate on swipe left
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Vendor Portal</Text>
                    <TouchableOpacity onPress={logout}>
                        <Text style={styles.logoutButton}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* Search */}
                <TextInput
                    placeholder="Search exports..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchInput}
                />

                {/* Export list */}
                <FlatList
                    data={exportsList}
                    keyExtractor={(item) => item._id}
                    renderItem={renderExportItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No exports found</Text>
                    }
                />

                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setAddModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>

                {/* Add Export Modal */}
                <Modal visible={isAddModalVisible} transparent={true}>
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add New Export</Text>
                            <TextInput
                                placeholder="Product Name"
                                value={product}
                                onChangeText={setProduct}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Destination"
                                value={destination}
                                onChangeText={setDestination}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Vehicle Number"
                                value={vehicleNo}
                                onChangeText={setVehicleNo}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Device Number"
                                value={deviceNo}
                                onChangeText={setDeviceNo}
                                style={styles.input}
                            />
                            <TextInput
                                placeholder="Driver Salary"
                                value={driverSalary}
                                onChangeText={setDriverSalary}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <Picker
                                selectedValue={selectedDriverId}
                                onValueChange={(itemValue) => setSelectedDriverId(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Driver" value="" />
                                {drivers.map((driver) => (
                                    <Picker.Item key={driver._id} label={driver.name} value={driver._id} />
                                ))}
                            </Picker>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.button} onPress={() => setAddModalVisible(false)}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.button} onPress={addExport}>
                                    <Text style={styles.buttonText}>Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* View Export Modal */}
                <Modal visible={isViewModalVisible} transparent={true}>
                    <View style={styles.modalView}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>View Export</Text>

                            {/* Displaying Product */}
                            <Text style={styles.modalLabel}>Product:</Text>
                            <Text style={styles.modalText}>{selectedExport?.product}</Text>

                            {/* Displaying Destination */}
                            <Text style={styles.modalLabel}>Destination:</Text>
                            <Text style={styles.modalText}>{selectedExport?.destination}</Text>

                            <Text style={styles.modalLabel}>Driver:</Text>
                            <Text style={styles.modalText}>
                                {selectedExport?.driver?.name || 'Not Assigned'}
                            </Text>
                            {/* Displaying Vehicle */}
                            <Text style={styles.modalLabel}>Vehicle:</Text>
                            <Text style={styles.modalText}>{selectedExport?.vehicleNo}</Text>

                            {/* Displaying Device */}
                            <Text style={styles.modalLabel}>Device:</Text>
                            <Text style={styles.modalText}>{selectedExport?.deviceNo}</Text>

                            {/* Displaying Status */}
                            <Text style={styles.modalLabel}>Driver Reaction (Status):</Text>
                            <Text style={styles.modalText}>{selectedExport?.status || 'Not Updated'}</Text>

                            {/* Update Driver Salary and Dates */}
                            <TextInput
                                placeholder="Start Date"
                                value={startDate}
                                onChangeText={setStartDate}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="End Date"
                                value={endDate}
                                onChangeText={setEndDate}
                                style={styles.input}
                            />

                            <TextInput
                                placeholder="Driver Salary"
                                value={driverSalary}
                                onChangeText={setDriverSalary}
                                keyboardType="numeric"
                                style={styles.input}
                            />

                            {/* Button Row */}
                            <View style={styles.buttonRow}>
                                <TouchableOpacity style={styles.button} onPress={() => setViewModalVisible(false)}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.button} onPress={updateExport}>
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

            </Swipeable>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: '#007bff' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    logoutButton: { color: '#fff', fontSize: 16 },
    searchInput: { padding: 10, margin: 10, borderWidth: 1, borderRadius: 5 },
    card: { padding: 15, margin: 10, borderBottomWidth: 1, borderBottomColor: '#ddd', borderRadius: 5 },
    cardTitle: { fontWeight: 'bold', fontSize: 16 },
    cardDetail: { marginTop: 5, fontSize: 14, color: '#555' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007bff', borderRadius: 30, width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 30 },
    emptyText: { textAlign: 'center', marginTop: 20, fontSize: 18 },
    modalView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    input: { padding: 10, marginBottom: 10, borderWidth: 1, borderRadius: 5 },
    picker: { marginBottom: 10 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    button: { padding: 10, backgroundColor: '#007bff', borderRadius: 5, width: '45%' },
    buttonText: { color: '#fff', textAlign: 'center' },
    swipeAction: { backgroundColor: 'orange', justifyContent: 'center', alignItems: 'center', width: 100 },
    swipeText: { color: '#fff', fontWeight: 'bold' },
    modalLabel: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    modalText: { fontSize: 16, marginBottom: 10 },
});


export default VendorDashboard;

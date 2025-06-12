import React, { useEffect, useState } from 'react';
import {
    View, Text, ActivityIndicator, FlatList, StyleSheet, Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // npm install @react-native-picker/picker
import { useNavigation } from '@react-navigation/native';  // <-- import this
import { IPADD } from './ipadd';

const STATUS_OPTIONS = ['Requested to start', 'Ongoing', 'Completed'];

const StartRequestPage = () => {
    const navigation = useNavigation();  // <-- use the hook here
    const [vendorId, setVendorId] = useState(null);
    const [allWorks, setAllWorks] = useState([]);
    const [filteredWorks, setFilteredWorks] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('Requested to start');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVendorIdAndWorks = async () => {
            try {
                const storedId = await AsyncStorage.getItem('userId');
                if (!storedId) {
                    setError('Vendor ID not found');
                    setLoading(false);
                    return;
                }

                setVendorId(storedId);

                const response = await axios.get(
                    `http://${IPADD}:5000/api/works/vendor/${storedId}`
                );

                setAllWorks(response.data.works);
                filterByStatus(response.data.works, selectedStatus);
            } catch (err) {
                console.error('❌ Error fetching works:', err);
                setError('Failed to load works');
            } finally {
                setLoading(false);
            }
        };

        fetchVendorIdAndWorks();
    }, []);

    const filterByStatus = (worksList, status) => {
        const filtered = worksList.filter(work => work.status === status);
        setFilteredWorks(filtered);
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        filterByStatus(allWorks, status);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Loading works...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vendor Work Requests</Text>

            <Picker
                selectedValue={selectedStatus}
                onValueChange={(value) => handleStatusChange(value)}
                style={styles.picker}
            >
                {STATUS_OPTIONS.map((status) => (
                    <Picker.Item key={status} label={status} value={status} />
                ))}
            </Picker>

            {filteredWorks.length === 0 ? (
                <Text>No works with status "{selectedStatus}".</Text>
            ) : (
                <FlatList
                    data={filteredWorks}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.label}>Destination:</Text>
                            <Text>{item.exportId?.destination || 'N/A'}</Text>

                            <Text style={styles.label}>Driver:</Text>
                            <Text>{item.driverId?.name || 'N/A'}</Text>

                            <Text style={styles.label}>Route:</Text>
                            <Text>{item.workRoute?.join(' → ') || 'N/A'}</Text>

                            <Text style={styles.label}>Status:</Text>
                            <Text>{item.status}</Text>

                            {/* Conditionally rendering buttons based on status */}
                            {item.status === 'Requested to start' && (
                                <Button
                                    title="Start Work"
                                    onPress={() => navigation.navigate('StartWorkMapPage', { workId: item._id })}
                                />
                            )}
                            {item.status === 'Ongoing' && (
                                <>
                                    <Button
                                        title="Update Location"
                                        onPress={() => navigation.navigate('UpdateLocationPage', { workId: item._id })}
                                    />
                                    <Button
                                        title="View Progress"
                                        onPress={() => navigation.navigate('WorkDetailsPage', { workId: item._id })}
                                    />
                                </>
                            )}
                            {item.status === 'Completed' && (
                                <Text style={styles.completedText}>Work is completed</Text>
                            )}
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12
    },
    picker: {
        height: 50,
        marginBottom: 16
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    label: {
        fontWeight: '600',
        marginTop: 4
    },
    completedText: {
        color: 'green',
        fontWeight: 'bold',
        marginTop: 8
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 16
    }
});

export default StartRequestPage;

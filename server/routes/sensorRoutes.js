const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Connect to MongoDB


// Define the Sensor Data Schema and Model
const sensorDataSchema = new mongoose.Schema({
  device_id: String,
  temperature: Number,
  humidity: Number,
  gasLevel: Number,
  recorded_at: { type: Date, default: Date.now },
});

const SensorData = mongoose.model('sensor_data', sensorDataSchema);

// Route to get latest sensor data by deviceId
router.get('/sensor-data/:deviceId', async (req, res) => {
     // Log the request body

  try {
    const deviceId = req.params.deviceId;
      //  console.log('✅ Request params:',deviceId ); // Log the request parameters
    // Fetch the latest sensor data for the given deviceId
    const sensorData = await SensorData.find({ device_id: deviceId })
      .sort({ recorded_at: -1 })
      .limit(1); // Get the most recent data
    
    if (sensorData.length === 0) {
      return res.status(404).json({ message: 'Sensor data not found' });
    }
    
    // Send the most recent sensor data as a response
    res.json(sensorData[0]);
     // Since we used `.limit(1)`, it returns an array with 1 element
  } catch (err) {
    console.error('Error fetching sensor data:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

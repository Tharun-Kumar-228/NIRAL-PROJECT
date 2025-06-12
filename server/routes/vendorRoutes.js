const express = require('express');
const router = express.Router();
const Export = require('../models/exportModel');
const Driver = require('../models/driverModel');
const axios = require('axios');

// POST /api/vendor/exports - Add new export
router.post('/vendor/exports', async (req, res) => {
  const { product, destination, vehicleNo, deviceNo, driverId, vendorId, driverSalary, startDateTime, deliveryDate } = req.body;

  // 📢 Console log full received body - PRETTY printed
  console.log('--- Received Export Data ---');
  console.log(JSON.stringify(req.body, null, 2));
  console.log('----------------------------');

  if (!product || !destination || !vehicleNo || !deviceNo || !driverId || !vendorId || !driverSalary || !startDateTime || !deliveryDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const newExport = new Export({
      product,
      destination,
      vehicleNo,
      deviceNo,
      driver: driverId,
      vendorId,
      driverSalary,
      startDateTime,
      deliveryDate,
    });

    await newExport.save();
    res.status(201).json({ success: true, message: 'Export created successfully', export: newExport });
  } catch (err) {
    console.error('Error creating export:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/vendor/exports?vendorId=xxx - Get all exports by vendor
router.get('/vendor/exports', async (req, res) => {
  try {
    const { vendorId } = req.query;
    const exports = await Export.find({ vendorId });

    // Fetch driver details for each export
    const exportsWithDriverDetails = await Promise.all(exports.map(async (exportItem) => {
      if (exportItem.driverId) {
        try {
          const driverResponse = await axios.get(`http://192.168.191.187:5000/api/drivers/${exportItem.driverId}`);
          exportItem.driver = driverResponse.data;  // Append driver details to export
        } catch (err) {
          console.error(`Error fetching driver details for export ${exportItem._id}:`, err);
          exportItem.driver = null;  // Handle errors gracefully
        }
      }
      return exportItem;
    }));

    res.json(exportsWithDriverDetails);
  } catch (err) {
    console.error('Error fetching vendor exports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/export/:exportId/update-dates - Update start and delivery dates of an export
router.put('/:exportId/update-dates', async (req, res) => {
  const { exportId } = req.params;
  const { startDateTime, deliveryDate } = req.body;

  if (!startDateTime || !deliveryDate) {
    return res.status(400).json({ message: 'Missing required dates' });
  }

  try {
    const exportRequest = await Export.findById(exportId);
    if (!exportRequest) {
      return res.status(404).json({ message: 'Export not found' });
    }

    exportRequest.startDateTime = new Date(startDateTime);
    exportRequest.deliveryDate = new Date(deliveryDate);

    await exportRequest.save();
    res.status(200).json({ message: 'Export dates updated successfully', export: exportRequest });
  } catch (err) {
    console.error('Error updating export dates:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

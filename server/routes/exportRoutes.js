const express = require('express');
const router = express.Router();
const Export = require('../models/exportModel');
const Driver = require('../models/driverModel');

// POST /api/vendor/exports - Add new export
router.post('/vendor/exports', async (req, res) => {
  const { product, destination, vehicleNo, deviceNo, driverId, vendorId, driverSalary, startDateTime, deliveryDate } = req.body;

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


// GET /api/vendor/exports?vendorId=xxx
router.get('/vendor/exports', async (req, res) => {
  try {
    const { vendorId } = req.query;

    // Fetch the exports and populate the driver details
    const exports = await Export.find({ vendorId })
      .populate('driver', 'name mobileNo licenseNo district state')  // <-- Populate all necessary fields for the driver
      .exec();

    res.json(exports);
  } catch (err) {
    console.error('Error fetching vendor exports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/driver/exports/:driverId
router.get('/driver/exports/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const exports = await Export.find({ driver: driverId, status: 'Pending' });
    res.status(200).json(exports);
  } catch (err) {
    console.error('Error fetching driver exports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/driver/exports/respond/:exportId
router.put('/driver/exports/respond/:exportId', async (req, res) => {
  const { exportId } = req.params;
  const { response } = req.body;

  if (!['Accepted', 'Rejected'].includes(response)) {
    return res.status(400).json({ message: 'Invalid response' });
  }

  try {
    const exportRequest = await Export.findById(exportId);
    if (!exportRequest) {
      return res.status(404).json({ message: 'Export not found' });
    }

    exportRequest.status = response;
    await exportRequest.save();

    res.status(200).json({ message: `Export ${response} successfully`, export: exportRequest });
  } catch (err) {
    console.error('Error updating export status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/exports - Get all exports (general purpose)
router.get('/exports', async (req, res) => {
  try {
    const exports = await Export.find().populate('driver', 'name mobileNo');
    res.status(200).json(exports);
  } catch (err) {
    console.error('Error fetching exports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/vendor/exports/:exportId', async (req, res) => {
  const { driverSalary, startDateTime, deliveryDate } = req.body;

  if (!driverSalary || !startDateTime || !deliveryDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const exportItem = await Export.findById(req.params.exportId);
    if (!exportItem) {
      return res.status(404).json({ message: 'Export not found' });
    }

    exportItem.driverSalary = driverSalary;
    exportItem.startDateTime = startDateTime;
    exportItem.deliveryDate = deliveryDate;

    await exportItem.save();
    res.status(200).json({ message: 'Export updated successfully', export: exportItem });
  } catch (err) {
    console.error('Error updating export:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

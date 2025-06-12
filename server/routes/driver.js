const express = require('express');
const router = express.Router();
const Driver = require('../models/driverModel');
const Export = require('../models/exportModel'); // Assuming you have an Export model

// for get /api/driver/
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:driverId', async (req, res) => {
  const { driverId } = req.params;

  try {
    // Find driver by ID
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    res.status(200).json(driver);  // Return driver details
  } catch (err) {
    console.error('Error fetching driver details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all pending exports available for the driver
router.get('/exports/:driverId', async (req, res) => {
  const { driverId } = req.params;
  console.log('Driver ID:', driverId); // Debugging line
  try {
    // Fetch exports for the given driver where the driver is assigned
    const exports = await Export.find({ driver: driverId, status: 'Pending' })
      .populate('vendorId', 'name') // Assuming you want the vendor name
      .populate('driver', 'name');  // Assuming you want the driver name

    // If no exports found need to be commented 
   
    res.status(200).json(exports);
  } catch (error) {
    console.error('Error fetching exports:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond to an export request (Accept/Reject)
router.put('/exports/respond/:exportId', async (req, res) => {
  const { exportId } = req.params;
  const { response } = req.body; // 'Accepted' or 'Rejected'

  if (!['Accepted', 'Rejected'].includes(response)) {
    return res.status(400).json({ message: 'Invalid response. It should be Accepted or Rejected.' });
  }

  try {
    // Find export request by ID
    const exportRequest = await Export.findById(exportId);

    // If export not found
    if (!exportRequest) {
      return res.status(404).json({ message: 'Export request not found' });
    }

    // Update the export request status
    exportRequest.status = response;
    await exportRequest.save();

    res.status(200).json({ message: `Request ${response}` });
  } catch (error) {
    console.error('Error responding to export:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all accepted works for the driver (Accepted exports)
router.get('/works/:driverId', async (req, res) => {
   // Debugging line
  const { driverId } = req.params;

  try {
    const works = await Export.find({
      driver: driverId,
      status: 'Accepted',
    }).populate('vendorId', 'name mobileNo')
      .exec();
    // If no accepted works found
    if (!works || works.length === 0) {
      return res.status(404).json({ message: 'No accepted works found for this driver' });
    }

    res.status(200).json(works);
  } catch (err) {
    console.error('Error fetching accepted works:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a work (Change status to 'In Progress' if the start date is valid)
router.put('/works/start/:exportId', async (req, res) => {
  const { exportId } = req.params;

  try {
    // Find export request by ID
    const exportRequest = await Export.findById(exportId);

    // If export not found
    if (!exportRequest) {
      return res.status(404).json({ message: 'Export request not found' });
    }

    // Check if current date is greater than or equal to the start date
    const currentDate = new Date();
    if (currentDate >= new Date(exportRequest.startDateTime)) {
      exportRequest.status = 'In Progress'; // Update status to 'In Progress'
      await exportRequest.save();
      res.status(200).json({ message: 'Work started successfully' });
    } else {
      res.status(400).json({ message: 'Cannot start work yet. Start date has not arrived.' });
    }
  } catch (err) {
    console.error('Error starting work:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

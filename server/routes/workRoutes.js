const express = require('express');
const router = express.Router();
const Work = require('../models/workModel');
const mongoose = require('mongoose');

// Create a new work entry
router.post('/works', async (req, res) => {
  try {
   
    console.log('✅ Request body:', req.body); // Log the request body
    console.log('✅ Request headers:', req.headers); // Log the request headers
    const {
      exportId,
      driverId,
      vendorId,
      deviceId,
      status,
      workRoute,
      startTime,
      endTime
    } = req.body;

    const newWork = new Work({
      exportId,
      driverId,
      vendorId,
      deviceId,
      status,
      workRoute,
      startTime,
      endTime
    });

    const savedWork = await newWork.save();
    res.status(201).json(savedWork);
  } catch (error) {
    console.error('❌ Error saving work:', error);
    res.status(500).json({ error: 'Server error while creating work' });
  }
});
// Get all works for a specific driver and check for active work
//api/works/:id
router.get('/works/:id', async (req, res) => {
  try {
    const driverId = req.params.id;

    // Find works associated with the driver and populate exportId and vendorId
    const works = await Work.find({ driverId: driverId })
      .populate('exportId', 'product destination startDateTime driverSalary')  // Populate specific fields of export
      .populate('vendorId', 'name mobileNo')  // Populate specific fields of vendor
      .exec();

    if (!works || works.length === 0) {
      return res.status(404).json({ message: 'No works found for this driver.' });
    }

    // Check for active work (Requested to start or Ongoing)
    const activeWork = works.find(work => work.status === 'Requested to start' || work.status === 'Ongoing');

    return res.status(200).json({
      works,
      activeWork: activeWork || null
    });
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).json({ message: 'Error fetching works', error: err.message });
  }
});
//api/work/:workId
router.get('/work/:workId', async (req, res) => {
  console.log('✅ Request params:', req.params); // Log the request parameters
  console.log('✅ Request headers:', req.headers); // Log the request headers 
  console.log('✅ Request body:', req.body); // Log the request body
  try {
    const workId = req.params.workId;
    console.log('✅ Work ID:', workId); // Log the work ID
    const work = await Work.findById(workId);

    console.log('✅ Work found:', work); // Log the found work
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    res.json(work);
  } catch (err) {
    console.error('Error fetching work:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get works for a specific vendor with optional status filter
router.get('/works/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.query;

    // Build query dynamically
    const query = { vendorId };
    if (status && status !== 'All') {
      query.status = status;
    }

    const works = await Work.find(query)
      .populate('exportId', 'product destination startDateTime driverSalary')
      .populate('driverId', 'name mobileNo');

    res.status(200).json({ works });
  } catch (err) {
    console.error('❌ Error fetching vendor works:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.put('/works/start/:id', async (req, res) => {
  try {
    const { destinationLocation, status } = req.body;

    const work = await Work.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          startTime: new Date(),
          destinationLocation
        }
      },
      { new: true }
    );

    if (!work) return res.status(404).send('Work not found');
    res.json(work);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.put('/works/update-routes/:workId', async (req, res) => {
  const { workId } = req.params;
  const { workRoute } = req.body;

  if (!mongoose.Types.ObjectId.isValid(workId)) {
    return res.status(400).json({ message: 'Invalid work ID format' });
  }

  if (!Array.isArray(workRoute) || workRoute.length === 0) {
    return res.status(400).json({ message: 'Invalid workRoute array' });
  }

  try {
    const updatedWork = await Work.findByIdAndUpdate(
      workId,
      { $set: { workRoute: workRoute } },
      { new: true, runValidators: true }
    );

    if (!updatedWork) {
      return res.status(404).json({ message: 'Work not found' });
    }

    res.status(200).json({
      message: 'Work route updated successfully',
      data: updatedWork,
    });
  } catch (err) {
    console.error('Error updating workRoute:', err);
    res.status(500).json({ message: 'Server error while updating workRoute' });
  }
});

router.put('/works/update-location/:workId', async (req, res) => {
  const { workId } = req.params;
  const { location } = req.body; // { latitude, longitude }

  try {
    const work = await Work.findById(workId);
    if (!work) {
      return res.status(404).send('Work not found');
    }

    work.destinationLocation = location; // Update location field
    await work.save();
    console.log('✅ Location updated:', work.destinationLocation); // Log the updated location
    console.log('✅ Work updated:', work); // Log the updated work
    res.send('Location updated successfully');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
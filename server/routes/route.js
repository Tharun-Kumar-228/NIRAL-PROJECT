const express = require('express');
const axios = require('axios');
const router = express.Router();
const Work = require('../models/workModel'); // Assuming you have a Work model

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDistrictFromNominatim(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'district-extractor/1.0 (your-email@example.com)',
      }
    });

    const address = response.data.address;
    return (
      address?.county ||
      address?.state_district ||
      address?.city_district ||
      address?.state ||
      null
    );
  } catch (error) {
    console.error(`Reverse geocoding failed at (${lat}, ${lon}):`, error.message);
    return null;
  }
}

router.post('/store', async (req, res) => {
  const { source, destination, route, workId } = req.body;

  if (!Array.isArray(route) || route.length === 0 || !workId) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  console.log('Route received. Processing district extraction...');

  const districts = [];
  let lastDistrict = null;

  for (let i = 0; i < route.length; i += 250) {
    const [lat, lon] = route[i];
    const district = await getDistrictFromNominatim(lat, lon);

    if (district && district !== lastDistrict) {
      districts.push(district);
      lastDistrict = district;
    }

    await sleep(1000); // rate limit
  }

  console.log('Extracted districts:', districts);

  // 🔁 Now send to update route
  try {
    const response = await axios.put(
      `http://localhost:5000/api/works/update-routes/${workId}`,
      { workRoute: districts }
    );

    return res.status(200).json({
      message: 'Districts extracted and work updated successfully',
      updatedWork: response.data.data,
    });
  } catch (err) {
    console.error('Error sending update to /works/update-routes:', err.message);
    return res.status(500).json({ message: 'Failed to update work route' });
  }
});

router.get('/districts', async (req, res) => {
    try {
      const works = await Work.find({}, 'workRoute'); // Only fetch workRoute field
      const allDistricts = works.flatMap(work => work.workRoute || []);
  
      // Get unique district names
      const uniqueDistricts = [...new Set(allDistricts)];
  
      res.status(200).json({ districts: uniqueDistricts });
    } catch (error) {
      console.error('Error fetching districts:', error);
      res.status(500).json({ message: 'Server error while fetching districts' });
    }
  });
  

module.exports = router;

const express = require('express');
const router = express.Router();
const Customer = require('../models/customerModel');
const Work = require('../models/workModel');

// Add this inside your routes file
router.get('/customer/matching-works/:customerId', async (req, res) => {
    const { customerId } = req.params;
  
    try {
      // Fetch customer's district
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      const customerDistrict = customer.district;
  
      // Find works where the district is included in workRoute
      const matchingWorks = await Work.find({ workRoute: customerDistrict })
        .populate({
          path: 'exportId'
        })
        .populate({
          path: 'vendorId',
          select: 'name mobileNo'
        })
        .populate({
          path: 'driverId',
          select: 'name'
        });
  
      res.status(200).json({
        message: 'Matching works found',
        data: matchingWorks,
      });
    } catch (err) {
      console.error('Error fetching matching works:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
router.get('/customers/:id', async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      res.status(200).json({ data: customer });
    } catch (error) {
      console.error('Error fetching customer:', error.message);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;

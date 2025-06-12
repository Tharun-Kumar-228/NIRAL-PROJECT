// models/workModel.js
const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  exportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Export',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  status: {
    type: String,
    enum: ['Requested to start', 'Ongoing', 'Completed'],
    default: 'Requested to start'
  },
  workRoute: {
    type: [String],  // Array of district names
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    default: null
  },
  destinationLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  endTime: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const Work = mongoose.model('Work', workSchema);

module.exports = Work;

const mongoose = require('mongoose');

const exportSchema = new mongoose.Schema({
  product: { type: String, required: true },
  destination: { type: String, required: true },
  vehicleNo: { type: String, required: true },   // <-- add vehicleNo
  deviceNo: { type: String, required: true },     // <-- add deviceNo
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true }, // <-- add vendorId
  driverSalary: { type: Number, required: true },
  startDateTime: { type: Date, required: true },
  deliveryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
}, { timestamps: true });

const Export = mongoose.model('Export', exportSchema);

module.exports = Export;

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const signupRoute = require('./routes/signupRoute');
const loginRoute = require('./routes/loginRoute'); // ✅ Import login route
require('dotenv').config();
const exportRoutes = require('./routes/exportRoutes');
const driverRoutes = require('./routes/driver');
const workRoutes = require('./routes/workRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const routeRoutes = require('./routes/route');
const customerRoutes = require('./routes/CustomerRoute');
const app = express();

// Middleware to parse JSON
app.use(bodyParser.json());

// Routes
app.use('/api', signupRoute); // ✅ Signup route
app.use('/api', loginRoute);  // ✅ Login route
app.use('/api', exportRoutes); // ✅ Export route
app.use('/api/drivers', driverRoutes);// ✅ Driver route
app.use('/api', workRoutes); // ✅ Work route
app.use('/api', sensorRoutes); // ✅ Sensor route
app.use('/api/route', routeRoutes); // ✅ Route route
app.use('/api', customerRoutes); // ✅ Customer route
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/FreshGoods', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Error connecting to MongoDB:', err));

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

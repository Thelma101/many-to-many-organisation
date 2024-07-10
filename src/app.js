require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const authenticateJWT = require('./middleware/authenticateJWT');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/users', authenticateJWT, userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

// const server = app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// module.exports = { app, server };

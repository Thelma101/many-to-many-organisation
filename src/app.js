const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const authenticateJWT = require('./middleware/authenticateJWT');

require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/users', authenticateJWT, userRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });



const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };

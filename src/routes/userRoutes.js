const express = require('express');
const { getUserById } = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT); // Ensure all routes below are protected

router.get('/:id', getUserById);

module.exports = router;

const express = require('express');
const { getUserById } = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');
const { validateUserFields, validateLoginFields } = require('../middleware/validation');
const {updateUser, deleteUser} = require('../middleware/validation');

const router = express.Router();

router.use(authenticateJWT); 

router.get('/:id', getUserById);
// router.put('/:id',  updateUser, getUserById);
router.put('/:id',  updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
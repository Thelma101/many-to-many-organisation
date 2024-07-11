// routes/userRouter.js
const express = require('express');
// const { getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { getUserById } = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);

router.get('/:id', getUserById);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);

module.exports = router;


// const express = require('express');
// const { getUserById } = require('../controllers/userController');
// const authenticateJWT = require('../middleware/authenticateJWT');
// const { validateUserFields, validateLoginFields } = require('../middleware/validation');
// const {updateUser, deleteUser} = require('../middleware/validation');

// const router = express.Router();

// router.use(authenticateJWT); 

// router.get('/:id', getUserById);
// // router.put('/:id',  updateUser, getUserById);
// router.put('/:id',  updateUser);
// router.delete('/:id', deleteUser);

// module.exports = router;

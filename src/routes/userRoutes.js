const express = require('express');
// const { updateUser, deleteUser } = require('../controllers/userController');
// const { getUserById, getOrganisations,  getOrganisationById } = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');
const { getOrganisations } = require('../controllers/userController')
const router = express.Router();

router.use(authenticateJWT);

// router.get('/:id', getOrganisationByUserId);
// router.get('/:orgId', getOrganisationById);
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

const express = require('express');
const {
  createOrganisation,
  // addUserToOrganisation,
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);


// router.get('/created', getUserCreatedOrganisations);

router.post('/', createOrganisation);
// router.post('/:orgId/users', addUserToOrganisation);

module.exports = router;

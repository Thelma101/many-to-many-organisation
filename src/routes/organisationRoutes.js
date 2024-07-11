const express = require('express');
const {
  createOrganisation,
  getOrganisations,
  // getOrganisationId,
  // addUserToOrganisation,
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);


// router.get('/created', getUserCreatedOrganisations);

router.post('/', createOrganisation);
router.get('/', getOrganisations);
// router.get('/', getOrganisationId);

// router.post('/:orgId/users', addUserToOrganisation);

module.exports = router;

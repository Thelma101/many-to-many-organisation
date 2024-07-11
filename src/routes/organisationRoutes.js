const express = require('express');
const {
  createOrganisation,
  getOrganisations,
  getOrganisationId,
  addUserToOrganisation,
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

// router.use(authenticateJWT);

router.post('/', createOrganisation);
router.get('/', getOrganisations, authenticateJWT);
router.get('/:id', getOrganisationId, authenticateJWT);
router.post('/:orgId/users', addUserToOrganisation);

module.exports = router;

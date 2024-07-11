const express = require('express');
const {
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation,
//   getUserCreatedOrganisations
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getOrganisations);
// router.get('/created', getUserCreatedOrganisations);
router.get('/:orgId', getOrganisationById);
router.post('/', createOrganisation);
router.post('/:orgId/users', addUserToOrganisation);

module.exports = router;

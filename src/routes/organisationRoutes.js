const express = require('express');
const {
  getUserOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation,
//   getUserCreatedOrganisations
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getUserOrganisations);
// router.get('/created', getUserCreatedOrganisations);
router.get('/:orgId', getOrganisationById);
router.post('/', createOrganisation);
router.post('/:orgId/users', addUserToOrganisation);

module.exports = router;

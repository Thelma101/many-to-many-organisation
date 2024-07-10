const express = require('express');
const {
    getUserOrganisations,
    getOrganisationById,
    createOrganisation,
    addUserToOrganisation
} = require('../controllers/organisationController');
const authenticateJWT = require('../middleware/authenticateJWT');
// const { validateUserFields, validateLoginFields } = require('../middleware/validation');

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getUserOrganisations);
router.get('/:orgId', getOrganisationById);
router.post('/', createOrganisation);
router.post('/:orgId//users', addUserToOrganisation);

module.exports = router;




// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// const getUserOrganisations = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const organisations = await prisma.organisation.findMany({
//             where: { users: { some: { userId } } }
//         });

//         res.status(200).json({
//             status: 'success',
//             message: 'Organisations fetched successfully',
//             data: { organisations }
//         });
//     } catch (error) {
//         console.error('Error fetching organisations:', error);
//         res.status(500).json({
//             status: 'Internal server error',
//             message: 'Failed to fetch organisations',
//             statusCode: 500
//         });
//     }
// };

// const getOrganisationById = async (req, res) => {
//     try {
//         const organisation = await prisma.organisation.findUnique({
//             where: { orgId: req.params.orgId }
//         });

//         if (!organisation) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Organisation not found',
//                 statusCode: 404
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             message: 'Organisation fetched successfully',
//             data: { organisation }
//         });
//     } catch (error) {
//         console.error('Error fetching organisation:', error);
//         res.status(500).json({
//             status: 'Internal server error',
//             message: 'Failed to fetch organisation',
//             statusCode: 500
//         });
//     }
// };

// const createOrganisation = async (req, res) => {
//     const { name, description } = req.body;

//     try {
//         const organisation = await prisma.organisation.create({
//             data: {
//                 name,
//                 description,
//                 users: { connect: { userId: req.user.userId } }
//             }
//         });

//         res.status(201).json({
//             status: 'success',
//             message: 'Organisation created successfully',
//             data: { organisation }
//         });
//     } catch (error) {
//         console.error('Error creating organisation:', error);
//         res.status(400).json({
//             status: 'Bad request',
//             message: 'Organisation creation failed',
//             statusCode: 400
//         });
//     }
// };

// const addUserToOrganisation = async (req, res) => {
//     const { userId } = req.body;
//     const { orgId } = req.params;

//     try {
//         await prisma.organisation.update({
//             where: { orgId },
//             data: { users: { connect: { userId } } }
//         });

//         res.status(200).json({
//             status: 'success',
//             message: 'User added to organisation successfully'
//         });
//     } catch (error) {
//         console.error('Error adding user to organisation:', error);
//         res.status(400).json({
//             status: 'Bad request',
//             message: 'Failed to add user to organisation',
//             statusCode: 400
//         });
//     }
// };

// module.exports = {
//     getUserOrganisations,
//     getOrganisationById,
//     createOrganisation,
//     addUserToOrganisation
// };

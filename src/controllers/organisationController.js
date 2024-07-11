const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const createOrganisation = async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(422).json(validationErrorResponse('name', 'Name is required'));
    }
    const uuid = uuidv4().substring(0,10);
    try {
        const organisation = await prisma.organisation.create({
            data: {
                orgId: uuid,
                name,
                description,
                // users: { connect: { userId: req.user.userId } }
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Organisation created successfully',
            data: { organisation }
        });
    } catch (error) {
        console.error('Error creating organisation:', error);
        res.status(400).json({
            status: 'Bad request',
            message: 'Organisation creation failed',
            statusCode: 400
        });
    }
};
  
// const addUserToOrganisation = async (req, res) => {
//     const { orgId } = req.params;
//     const { userId } = req.body;
  
//     try {
//         const organisation = await prisma.organisation.findUnique({
//             where: { orgId },
//         });
  
//         if (!organisation) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'Organisation not found',
//             });
//         }
  
//         const user = await prisma.user.findUnique({
//             where: { userId },
//         });
  
//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found',
//             });
//         }
  
//         await prisma.userOrganisation.create({
//             data: {
//                 userId,
//                 orgId,
//             },
//         });
  
//         res.status(200).json({
//             status: 'success',
//             message: 'User added to organisation successfully',
//         });
//     } catch (error) {
//         console.error('Error adding user to organisation:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error',
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// };
  
module.exports = {
    createOrganisation,
    // addUserToOrganisation,
};

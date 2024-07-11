const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getOrganisationByUserId = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
  
    try {
        const user = await prisma.user.findUnique({
            where: { userId: id },
        });
  
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
  
        // Check if the user is in the same organisation
        // const userOrganisation = await prisma.organisation.findFirst({
        //     where: { userId: userId, orgId: { equals: organisation.orgId } },
        // });
        const organisation = await prisma.organisation.findUnique({
            where: { orgId: req.params.orgId }
        });
  
        if (!userOrganisation) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied',
            });
        }
  
        res.status(200).json({
            status: 'success',
            message: 'User found',
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    } finally {
        await prisma.$disconnect();
    }
};
  
// const getOrganisations = async (req, res) => {
//     try {
//         const userId = req.user.userId;
//         const organisations = await prisma.organisation.findMany({
//             where: { users: { some: { userId } } }
//         });
  
//         if (!organisations || organisations.length === 0) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'No organisations found for the user',
//                 statusCode: 404
//             });
//         }
  
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
//     } finally {
//         await prisma.$disconnect();
//     }
// };
  
// const getOrganisationById = async (req, res) => {
//     const { orgId } = req.params;
//     const userId = req.user.userId;
  
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
  
//         // Check if the user is in the same organisation
//         const userOrganisation = await prisma.userOrganisation.findFirst({
//             where: { userId, organisationId: orgId },
//         });
  
//         if (!userOrganisation) {
//             return res.status(403).json({
//                 status: 'error',
//                 message: 'Access denied',
//             });
//         }
  
//         res.status(200).json({
//             status: 'success',
//             message: 'Organisation found',
//             data: {
//                 orgId: organisation.orgId,
//                 name: organisation.name,
//                 description: organisation.description,
//             },
//         });
//     } catch (error) {
//         console.error('Error fetching organisation:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Internal server error',
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// };
  
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
    getOrganisationByUserId,
    // getOrganisations,
    // getOrganisationById,
    // addUserToOrganisation,
};

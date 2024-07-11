const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrganisation = async (req, res) => {
    const { name, description } = req.body;

    try {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Organisation name is required and must be a non-empty string',
                statusCode: 400
            });
        }

        const newOrganisation = await prisma.organisation.create({
            data: {
                orgId: uuidv4().substring(0, 8),
                name,
                description,
                creatorId: req.user.userId
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Organisation created successfully',
            data: { organisation: newOrganisation }
        });
    } catch (error) {
        console.error('Error creating organisation:', error);
        res.status(400).json({
            status: 'Bad Request',
            message: 'Failed to create organisation',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};


const getOrganisations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const organisations = await prisma.organisation.findMany({
            where: { creatorId: userId }
        });

        if (organisations.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'No organisations found for the user',
                statusCode: 404
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Organisations fetched successfully',
            data: { organisations }
        });
    } catch (error) {
        console.error('Error fetching organisations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch organisations',
            statusCode: 500
        });
    } finally {
        await prisma.$disconnect();
    }
};

const getOrganisationById = async (req, res) => {
    const { orgId } = req.params;

    try {
        const organisationById = await prisma.organisation.findUnique({
            where: { orgId },
            include: { users: true }
        });

        if (!organisationById) {
            return res.status(404).json({
                status: 'error',
                message: 'Organisation not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Organisation fetched successfully',
            data: { organisationById }
        });
        
    } catch (error) {
        console.error('Error fetching organisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch organisation',
            statusCode: 500
        });
    } finally {
        await prisma.$disconnect();
    }
};

const addUserToOrganisation = async (req, res) => {
    try {
        const { userId } = req.body;
        const { orgId } = req.params;

        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required and must be a non-empty string',
                statusCode: 400
            });
        }

        const user = await prisma.user.findUnique({ where: { userId } });
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const organisation = await prisma.organisation.findUnique({ where: { orgId } });
        if (!organisation) {
            return res.status(404).json({ status: 'error', message: 'Organisation not found' });
        }

        if (organisation.users.some((user) => user.userId === userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'User is already a member of the organisation',
                statusCode: 400
            });
        }

        await prisma.organisation.update({
            where: { orgId },
            data: { users: { connect: [{ userId }] } }
        });

        res.status(200).json({
            status: 'Success',
            message: 'User added to organisation successfully',
            data: { organisation }
        });
    } catch (error) {
        console.error('Error adding user to organisation:', error);
        res.status(400).json({
            status: 'error',
            message: 'Failed to add user to organisation',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};



module.exports = {
    getOrganisations,
    getOrganisationById,
    createOrganisation,
    addUserToOrganisation
};

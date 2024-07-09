const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserOrganisations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const organisations = await prisma.organisation.findMany({
            where: { users: { some: { userId } } }
        });

        if (!organisations || organisations.length === 0) {
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
            status: 'Internal server error',
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
        const organisation = await prisma.organisation.findUnique({
            where: { orgId }
        });

        if (!organisation) {
            return res.status(404).json({
                status: 'error',
                message: 'Organisation not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Organisation fetched successfully',
            data: { organisation }
        });
    } catch (error) {
        console.error('Error fetching organisation:', error);
        res.status(500).json({
            status: 'Internal server error',
            message: 'Failed to fetch organisation',
            statusCode: 500
        });
    } finally {
        await prisma.$disconnect();
    }
};



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

        const uuid = uuidv4(0, 10);
        const organisation = await prisma.organisation.create({
            data: {
                orgId: uuid,
                name,
                description,
                users: { create: [{ userId: req.user.userId }] }
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
            message: 'Client error',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};

const addUserToOrganisation = async (req, res) => {
    const { userId } = req.body;
    const { orgId } = req.params;

    try {
        if (!userId || typeof userId !== 'string' || userId.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'User ID is required and must be a non-empty string',
                statusCode: 400
            });
        }

        const organisation = await prisma.organisation.update({
            where: { orgId },
            data: { users: { connect: [{ userId }] } }
        });

        res.status(200).json({
            status: 'success',
            message: 'User added to organisation successfully',
            data: { organisation }
        });
    } catch (error) {
        console.error('Error adding user to organisation:', error);
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to add user to organisation',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    getUserOrganisations,
    getOrganisationById,
    createOrganisation,
    addUserToOrganisation
};

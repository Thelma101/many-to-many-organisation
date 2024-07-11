const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');

const createOrganisation = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.userId;
  
    if (!name) {
        return res.status(422).json(validationErrorResponse('name', 'Name is required'));
    }
  
    try {
        const organisation = await prisma.organisation.create({
            data: {
                orgId: uuidv4(),
                name,
                description,
                creatorId: userId,
            },
        });
  
        await prisma.userOrganisation.create({
            data: {
                userId,
                orgId: organisation.orgId,
            },
        });
  
        res.status(201).json({
            status: 'success',
            message: 'Organisation created successfully',
            data: {
                orgId: organisation.orgId,
                name: organisation.name,
                description: organisation.description,
            },
        });
    } catch (error) {
        console.error('Error creating organisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    } finally {
        await prisma.$disconnect();
    }
};
  
const addUserToOrganisation = async (req, res) => {
    const { orgId } = req.params;
    const { userId } = req.body;
  
    try {
        const organisation = await prisma.organisation.findUnique({
            where: { orgId },
        });
  
        if (!organisation) {
            return res.status(404).json({
                status: 'error',
                message: 'Organisation not found',
            });
        }
  
        const user = await prisma.user.findUnique({
            where: { userId },
        });
  
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }
  
        await prisma.userOrganisation.create({
            data: {
                userId,
                orgId,
            },
        });
  
        res.status(200).json({
            status: 'success',
            message: 'User added to organisation successfully',
        });
    } catch (error) {
        console.error('Error adding user to organisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    } finally {
        await prisma.$disconnect();
    }
};
  
module.exports = {
    createOrganisation,
    addUserToOrganisation,
};

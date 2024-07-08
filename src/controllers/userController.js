const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userId: req.params.id }
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'Internal server error',
            message: 'Failed to fetch user',
            statusCode: 500
        });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    getUserById
};

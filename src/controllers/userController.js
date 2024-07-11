const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


const getOrganisations = async (req, res) => {
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

const getOrganisationByUserId = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { userId : id },
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found',
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'User found',
            data: {
                user
            },
        });
    } catch (error) {
        console.error('Error fetching organisation:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    } finally {
        await prisma.$disconnect();
    }
};


module.exports = {
    getOrganisations,
    getOrganisationByUserId,
};

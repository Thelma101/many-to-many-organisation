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

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone } = req.body;

    try {
        const user = await prisma.user.update({
            where: { userId: id },
            data: { firstName, lastName, email, phone }
        });

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to update user',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { userId: id }
        });

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(400).json({
            status: 'Bad request',
            message: 'Failed to delete user',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    getUserById,
    updateUser,
    deleteUser,
};



// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// const getUserById = async (req, res) => {
//     try {
//         const user = await prisma.user.findUnique({
//             where: { userId: req.params.id }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found',
//                 statusCode: 404
//             });
//         }

//         res.status(200).json({
//             status: 'success',
//             data: { user }
//         });
//     } catch (error) {
//         console.error('Error fetching user:', error);
//         res.status(500).json({
//             status: 'Internal server error',
//             message: 'Failed to fetch user',
//             statusCode: 500
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

// const updateUser = async (req, res) => {
//     const { id } = req.params;
//     const { firstName, lastName, email, phone, password } = req.body;

//     try {
//         const updateData = {};

//         if (firstName) updateData.firstName = firstName;
//         if (lastName) updateData.lastName = lastName;
//         if (email) updateData.email = email;
//         if (phone) updateData.phone = phone;
//         if (password) {
//             const hashedPassword = await bcrypt.hash(password, saltRounds);
//             updateData.password = hashedPassword;
//         }

//         const user = await prisma.user.update({
//             where: { userId: id },
//             data: updateData
//         });

//         res.status(200).json({
//             status: 'success',
//             message: 'User updated successfully',
//             data: { user }
//         });
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(400).json({
//             status: 'Bad request',
//             message: 'Failed to update user',
//             statusCode: 400
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

// const deleteUser = async (req, res) => {
//     const { id } = req.params;

//     try {
//         await prisma.user.delete({
//             where: { userId: id }
//         });

//         res.status(200).json({
//             status: 'success',
//             message: 'User deleted successfully'
//         });
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(400).json({
//             status: 'Bad request',
//             message: 'Failed to delete user',
//             statusCode: 400
//         });
//     } finally {
//         await prisma.$disconnect();
//     }
// };

// module.exports = {
//     getUserById,
//     updateUser,
//     deleteUser,
// };

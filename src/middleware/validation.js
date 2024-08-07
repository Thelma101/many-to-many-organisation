const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const saltRounds = 10;
const secret = 'jwt_secret';

const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { userId: req.params.id }
        });

        if (!user) {
            console.error('User not found for ID:', req.params.id);
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
            status: 'error',
            message: 'Internal server error',
            statusCode: 500
        });
    } finally {
        await prisma.$disconnect();
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, password } = req.body;

    try {
        const updateData = {};

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            updateData.password = hashedPassword;
        }

        const user = await prisma.user.update({
            where: { userId: id },
            data: updateData
        });

        res.status(200).json({
            status: 'success',
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({
            status: 'error',
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
            status: 'error',
            message: 'Failed to delete user',
            statusCode: 400
        });
    } finally {
        await prisma.$disconnect();
    }
};

const validateUserFields = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    const errors = [];

    if (!firstName) {
        errors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!lastName) {
        errors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (!email) {
        errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password) {
        errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length > 0) {
        console.error('Validation errors:', errors);
        return res.status(422).json({ errors });
    }

    next();
};

const validateLoginFields = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.error('Validation error: Email and password are required');
        return res.status(422).json({
            errors: [
                { field: !email ? 'email' : 'password', message: 'Email and password are required' }
            ]
        });
    }
    next();
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone
            }
        });

        const defaultOrgName = `${firstName}'s Organisation`;
        const organisation = await prisma.organisation.create({
            data: {
                name: defaultOrgName,
                users: { connect: { userId: user.userId } }
            }
        });

        const accessToken = jwt.sign({ userId: user.userId }, secret);
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                accessToken,
                user
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(400).json({
            status: 'error',
            message: 'Registration unsuccessful',
            statusCode: 400
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.error('Authentication error: Invalid email or password');
            return res.status(401).json({
                status: 'error',
                message: 'Invalid email or password',
                statusCode: 401
            });
        }

        const accessToken = jwt.sign({ userId: user.userId }, secret);
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken,
                user
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            statusCode: 500
        });
    }
};

const getOrganisations = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const organisations = await prisma.organisation.findMany({
            where: { users: { some: { userId } } }
        });

        res.status(200).json({
            status: 'success',
            message: 'Organisations fetched successfully',
            data: { organisations }
        });
    } catch (error) {
        console.error('Error fetching organisations:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            statusCode: 500
        });
    }
};

const getOrganisationById = async (req, res) => {
    try {
        const organisation = await prisma.organisation.findUnique({
            where: { orgId: req.params.orgId }
        });

        if (!organisation) {
            console.error('Organisation not found for ID:', req.params.orgId);
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
            status: 'error',
            message: 'Internal server error',
            statusCode: 500
        });
    }
};

const createOrganisation = async (req, res) => {
    const { name, description } = req.body;

    try {
        const organisation = await prisma.organisation.create({
            data: {
                name,
                description,
                users: { connect: { userId: req.user.userId } }
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
            status: 'error',
            message: 'Organisation creation failed',
            statusCode: 400
        });
    }
};

const addUserToOrganisation = async (req, res) => {
    const { userId } = req.body;
    const { orgId } = req.params;

    try {
        await prisma.organisation.update({
            where: { orgId },
            data: { users: { connect: { userId } } }
        });

        res.status(200).json({
            status: 'success',
            message: 'User added to organisation successfully'
        });
    } catch (error) {
        console.error('Error adding user to organisation:', error);
        res.status(400).json({
            status: 'error',
            message: 'Failed to add user to organisation',
            statusCode: 400
        });
    }
};

module.exports = {
    getUserById,
    updateUser,
    deleteUser,
    validateUserFields,
    validateLoginFields,
    registerUser,
    loginUser,
    getOrganisations,
    getOrganisationById,
    createOrganisation,
    addUserToOrganisation,
};



// const validateUserFields = (req, res, next) => {
//     const { firstName, lastName, email, password } = req.body;
//     const errors = [];
  
//     if (!firstName) {
//       errors.push({ field: 'firstName', message: 'First name is required' });
//     }
//     if (!lastName) {
//       errors.push({ field: 'lastName', message: 'Last name is required' });
//     }
//     if (!email) {
//       errors.push({ field: 'email', message: 'Email is required' });
//     }
//     if (!password) {
//       errors.push({ field: 'password', message: 'Password is required' });
//     }
  
//     if (errors.length > 0) {
//       return res.status(422).json({ errors });
//     }
  
//     next();
//   };
  
//   const validateLoginFields = (req, res, next) => {
//     const { email, password } = req.body;
//     const errors = [];
  
//     if (!email) {
//       errors.push({ field: 'email', message: 'Email is required' });
//     }
//     if (!password) {
//       errors.push({ field: 'password', message: 'Password is required' });
//     }
  
//     if (errors.length > 0) {
//       return res.status(422).json({ errors });
//     }
  
//     next();
//   };
  
//   module.exports = {
//     validateUserFields,
//     validateLoginFields
//   };
  

// const validateUserFields = (req, res, next) => {
//     const { firstName, lastName, email, password } = req.body;
//     const errors = [];
  
//     if (!firstName) {
//       errors.push({ field: 'firstName', message: 'First name is required' });
//     }
//     if (!lastName) {
//       errors.push({ field: 'lastName', message: 'Last name is required' });
//     }
//     if (!email) {
//       errors.push({ field: 'email', message: 'Email is required' });
//     }
//     if (!password) {
//       errors.push({ field: 'password', message: 'Password is required' });
//     }
  
//     if (errors.length > 0) {
//       return res.status(422).json({ errors });
//     }
  
//     next();
//   };
  
//   const validateLoginFields = (req, res, next) => {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(422).json({
//         errors: [
//           { field: !email ? 'email' : 'password', message: 'Email and password are required' }
//         ]
//       });
//     }
//     next();
//   };
  
//   module.exports = {
//     validateUserFields,
//     validateLoginFields
//   };
  
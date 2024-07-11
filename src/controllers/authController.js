const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4:uuidv4 } = require('uuid');
const prisma = new PrismaClient();
const saltRounds = 10;
const secret = process.env.JWT_SECRET || 'jwt_secret';

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        // Check if the email is already in use
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ status: 'error', message: 'Email already in use' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = uuidv4().substring(0, 8);
        // Create a new user
        const newUser = await prisma.user.create({
            data: { userId, firstName, lastName, email, password: hashedPassword, phone }
        });

        // Create a default organization for the user
        const organisationName = `${firstName}'s Organisation`;
        await prisma.organisation.create({
            data: {
                name: organisationName,
                // description,
                // users: { connect: { userId: newUser.userId } }
            
            }
        });

        // Generate JWT access token
        const accessToken = jwt.sign({ userId: newUser.userId }, secret);

        // Respond with success message and user data
        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                accessToken,
                user: {
                    userId: newUser.userId,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    phone: newUser.phone
                },
                organisation: {
                    organisation: organisationName
                }
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(400).json({ status: 'Bad request', message: 'Registration unsuccessful', statusCode: 400 });
    } finally {
        await prisma.$disconnect();
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });

        // If user doesn't exist or password is incorrect, respond with error
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password', statusCode: 401 });
        }

        // Generate JWT access token
        const accessToken = jwt.sign({ userId: user.userId }, secret);

        // Respond with success message and user data
        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                accessToken,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                }
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: 'error', message: 'Login failed', statusCode: 500 });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    registerUser,
    loginUser
};


// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const secret = 'your_jwt_secret'; // Replace with your actual secret key
// const saltRounds = 10;

// const registerUser = async (req, res) => {
//     const { firstName, lastName, email, password, phone } = req.body;

//     try {
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         const user = await prisma.user.create({
//             data: {
//                 firstName,
//                 lastName,
//                 email,
//                 password: hashedPassword,
//                 phone
//             }
//         });
        

//         const defaultOrgName = `${firstName}'s Organisation`;
//         const organisation = await prisma.organisation.findFirst({
//             where: { name: defaultOrgName }
//         });

//         if (!organisation) {
//             await prisma.organisation.create({
//                 data: {
//                     name: defaultOrgName,
//                     users: { connect: { userId: user.userId } }
//                 }
//             });
//         }

//         const accessToken = jwt.sign({ userId: user.userId }, secret);
//         res.status(201).json({
//             status: 'success',
//             message: 'Registration successful',
//             data: {
//                 accessToken,
//                 user
//             }
//         });
//     } catch (error) {
//         console.error('Error during registration:', error);
//         res.status(400).json({
//             status: 'Bad request',
//             message: 'Registration unsuccessful',
//             statusCode: 400
//         });
//     }
// };

// const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await prisma.user.findUnique({
//             where: { email }
//         });

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({
//                 status: 'error',
//                 message: 'Invalid email or password',
//                 statusCode: 401
//             });
//         }

//         const accessToken = jwt.sign({ userId: user.userId }, secret);
//         res.status(200).json({
//             status: 'success',
//             message: 'Login successful',
//             data: {
//                 accessToken,
//                 user
//             }
//         });
//     } catch (error) {
//         console.error('Error during login:', error);
//         res.status(500).json({
//             status: 'Internal server error',
//             message: 'Login failed',
//             statusCode: 500
//         });
//     }
// };

// module.exports = {
//     registerUser,
//     loginUser
// };



// // const { PrismaClient } = require('@prisma/client');
// // const bcrypt = require('bcrypt');
// // const jwt = require('jsonwebtoken');
// // const { v4: uuidv4 } = require('uuid');
// // const prisma = new PrismaClient();
// // const saltRounds = 10;
// // const secret = process.env.JWT_SECRET || 'jwt_secret';

// // const registerUser = async (req, res) => {
// //     const { firstName, lastName, email, password, phone } = req.body;

// //     try {
// //         const existingUser = await prisma.user.findUnique({ where: { email } });
// //         if (existingUser) {
// //             return res.status(400).json({
// //                 status: 'error',
// //                 message: 'Email already in use',
// //                 statusCode: 400,
// //             });
// //         }

// //         const hashedPassword = await bcrypt.hash(password, saltRounds);
// //         const userId = uuidv4().substring(0, 8);

// //         const newUser = await prisma.user.create({
// //             data: { userId, firstName, lastName, email, password: hashedPassword, phone },
// //         });

// //         const organisationName = `${firstName}'s Organisation`;

// //         await prisma.organisation.create({
// //             data: { orgId: userId, name: organisationName, users: { connect: [{ userId }] } },
// //         });

// //         const accessToken = jwt.sign({ userId: newUser.userId }, secret);

// //         res.status(201).json({
// //             status: 'success',
// //             message: 'Registration successful',
// //             data: {
// //                 accessToken,
// //                 user: {
// //                     userId: newUser.userId,
// //                     firstName: newUser.firstName,
// //                     lastName: newUser.lastName,
// //                     email: newUser.email,
// //                     phone: newUser.phone,
// //                 },
// //             },
// //         });
// //     } catch (error) {
// //         console.error('Error during registration:', error);
// //         res.status(400).json({
// //             status: 'error',
// //             message: 'Registration unsuccessful',
// //             statusCode: 400,
// //         });
// //     } finally {
// //         await prisma.$disconnect();
// //     }
// // };

// // const loginUser = async (req, res) => {
// //     const { email, password } = req.body;

// //     try {
// //         const user = await prisma.user.findUnique({ where: { email } });
// //         if (!user || !(await bcrypt.compare(password, user.password))) {
// //             return res.status(401).json({
// //                 status: 'error',
// //                 message: 'Invalid email or password',
// //             });
// //         }

// //         const accessToken = jwt.sign({ userId: user.userId }, secret);

// //         res.status(200).json({
// //             status: 'success',
// //             message: 'Login successful',
// //             data: {
// //                 accessToken,
// //                 user: {
// //                     userId: user.userId,
// //                     firstName: user.firstName,
// //                     lastName: user.lastName,
// //                     email: user.email,
// //                     phone: user.phone,
// //                 },
// //             },
// //         });
// //     } catch (error) {
// //         console.error('Error during login:', error);
// //         res.status(500).json({
// //             status: 'error',
// //             message: 'Login failed',
// //         });
// //     } finally {
// //         await prisma.$disconnect();
// //     }
// // };

// // module.exports = {
// //     registerUser,
// //     loginUser,
// // };



// // // const { PrismaClient } = require('@prisma/client');
// // // const bcrypt = require('bcrypt');
// // // const jwt = require('jsonwebtoken');
// // // const { v4: uuidv4 } = require('uuid');
// // // const prisma = new PrismaClient();
// // // const saltRounds = 10;
// // // const secret = process.env.JWT_SECRET || 'jwt_secret';

// // // const registerUser = async (req, res) => {
// // //     const { firstName, lastName, email, password, phone } = req.body;

// // //     try {
// // //         const existingUser = await prisma.user.findUnique({ where: { email } });
// // //         if (existingUser) {
// // //             return res.status(400).json({ 
// // //                 status: 'error', 
// // //                 message: 'Email already in use', 
// // //                 statusCode: 400 
// // //             });
// // //         }
// // //         const hashedPassword = await bcrypt.hash(password, saltRounds);

// // //         const uuid = uuidv4().substring(0,8);
// // //         const newUser = await prisma.user.create({
// // //             data: { 
// // //                 userId: uuid,
// // //                 firstName, 
// // //                 lastName, 
// // //                 email, 
// // //                 password: hashedPassword, 
// // //                 phone 
// // //             }
// // //         });

// // //         const organisationName = `${firstName}'s Organisation`;
// // //         await prisma.organisation.create({
// // //             data: {
// // //                 orgId: uuid, 
// // //                 name: organisationName,
// // //                 users: { userId: newUser.userId }
// // //                     // create: [{ userId: newUser.userId }] 
// // //                 // }
// // //             }
// // //         });

// // //         const accessToken = jwt.sign({ userId: newUser.userId }, secret);

// // //         res.status(201).json({
// // //             status: 'success',
// // //             message: 'Registration successful',
// // //             data: {
// // //                 accessToken,
// // //                 user: {
// // //                     userId: newUser.userId,
// // //                     firstName: newUser.firstName,
// // //                     lastName: newUser.lastName,
// // //                     email: newUser.email,
// // //                     phone: newUser.phone
// // //                 }
// // //             }
// // //         });
// // //     } catch (error) {
// // //         console.error('Error during registration:', error);
// // //         res.status(400).json({ 
// // //             status: 'Bad request', 
// // //             message: 'Registration unsuccessful', 
// // //             statusCode: 400 
// // //         });
// // //     } finally {
// // //         await prisma.$disconnect();
// // //     }
// // // };

// // // const loginUser = async (req, res) => {
// // //     const { email, password } = req.body;

// // //     try {
// // //         const user = await prisma.user.findUnique({ where: { email } });
// // //         if (!user || !(await bcrypt.compare(password, user.password))) {
// // //             return res.status(401).json({ 
// // //                 status: 'error', 
// // //                 message: 'Invalid email or password', 
// // //                 statusCode: 401 
// // //             });
// // //         }

// // //         const accessToken = jwt.sign({ userId: user.userId }, secret);

// // //         res.status(200).json({
// // //             status: 'success',
// // //             message: 'Login successful',
// // //             data: {
// // //                 accessToken,
// // //                 user: {
// // //                     userId: user.userId,
// // //                     firstName: user.firstName,
// // //                     lastName: user.lastName,
// // //                     email: user.email,
// // //                     phone: user.phone
// // //                 }
// // //             }
// // //         });
// // //     } catch (error) {
// // //         console.error('Error during login:', error);
// // //         res.status(500).json({ 
// // //             status: 'error', 
// // //             message: 'Login failed', 
// // //             statusCode: 500 
// // //         });
// // //     } finally {
// // //         await prisma.$disconnect();
// // //     }
// // // };

// // // module.exports = {
// // //     registerUser,
// // //     loginUser
// // // };



// // // const { PrismaClient } = require('@prisma/client');
// // // const bcrypt = require('bcrypt');
// // // const jwt = require('jsonwebtoken');

// // // const prisma = new PrismaClient();
// // // const saltRounds = 10;
// // // const secret = process.env.JWT_SECRET || 'jwt_secret';

// // // const registerUser = async (req, res) => {
// // //     const { firstName, lastName, email, password, phone } = req.body;

// // //     try {
// // //         const existingUser = await prisma.user.findUnique({ where: { email } });
// // //         if (existingUser) {
// // //             return res.status(400).json({ 
// // //                 status: 'error', 
// // //                 message: 'Email already in use', 
// // //                 statusCode: 400 
// // //             });
// // //         }

// // //         const hashedPassword = await bcrypt.hash(password, saltRounds);

// // //         const newUser = await prisma.user.create({
// // //             data: { 
// // //                 firstName, 
// // //                 lastName, 
// // //                 email, 
// // //                 password: hashedPassword, 
// // //                 phone 
// // //             }
// // //         });

// // //         const organisationName = `${firstName}'s Organisation`;
// // //         await prisma.organisation.create({
// // //             data: {
// // //                 name: organisationName,
// // //                 users: { 
// // //                     create: [{ userId: newUser.userId }] 
// // //                 }
// // //             }
// // //         });

// // //         const accessToken = jwt.sign({ userId: newUser.userId }, secret);

// // //         res.status(201).json({
// // //             status: 'success',
// // //             message: 'Registration successful',
// // //             data: {
// // //                 accessToken,
// // //                 user: {
// // //                     userId: newUser.userId,
// // //                     firstName: newUser.firstName,
// // //                     lastName: newUser.lastName,
// // //                     email: newUser.email,
// // //                     phone: newUser.phone
// // //                 }
// // //             }
// // //         });
// // //     } catch (error) {
// // //         console.error('Error during registration:', error);
// // //         res.status(400).json({ 
// // //             status: 'Bad request', 
// // //             message: 'Registration unsuccessful', 
// // //             statusCode: 400 
// // //         });
// // //     } finally {
// // //         await prisma.$disconnect();
// // //     }
// // // };

// // // const loginUser = async (req, res) => {
// // //     const { email, password } = req.body;

// // //     try {
// // //         const user = await prisma.user.findUnique({ where: { email } });
// // //         if (!user || !(await bcrypt.compare(password, user.password))) {
// // //             return res.status(401).json({ 
// // //                 status: 'error', 
// // //                 message: 'Invalid email or password', 
// // //                 statusCode: 401 
// // //             });
// // //         }

// // //         const accessToken = jwt.sign({ userId: user.userId }, secret);

// // //         res.status(200).json({
// // //             status: 'success',
// // //             message: 'Login successful',
// // //             data: {
// // //                 accessToken,
// // //                 user: {
// // //                     userId: user.userId,
// // //                     firstName: user.firstName,
// // //                     lastName: user.lastName,
// // //                     email: user.email,
// // //                     phone: user.phone
// // //                 }
// // //             }
// // //         });
// // //     } catch (error) {
// // //         console.error('Error during login:', error);
// // //         res.status(500).json({ 
// // //             status: 'error', 
// // //             message: 'Login failed', 
// // //             statusCode: 500 
// // //         });
// // //     } finally {
// // //         await prisma.$disconnect();
// // //     }
// // // };

// // // module.exports = {
// // //     registerUser,
// // //     loginUser
// // // };

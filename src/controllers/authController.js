const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const saltRounds = 10;
const secret = process.env.JWT_SECRET || 'jwt_secret';

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Email already in use', 
                statusCode: 400 
            });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await prisma.user.create({
            data: { 
                firstName, 
                lastName, 
                email, 
                password: hashedPassword, 
                phone 
            }
        });

        const organisationName = `${firstName}'s Organisation`;
        await prisma.organisation.create({
            data: {
                name: organisationName,
                users: { 
                    create: [{ userId: newUser.userId }] 
                }
            }
        });

        const accessToken = jwt.sign({ userId: newUser.userId }, secret);

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
                }
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(400).json({ 
            status: 'Bad request', 
            message: 'Registration unsuccessful', 
            statusCode: 400 
        });
    } finally {
        await prisma.$disconnect();
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
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
        res.status(500).json({ 
            status: 'error', 
            message: 'Login failed', 
            statusCode: 500 
        });
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    registerUser,
    loginUser
};

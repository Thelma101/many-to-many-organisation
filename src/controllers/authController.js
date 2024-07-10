const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { generateAccessToken } = require('./utils/authUtils');

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
        statusCode: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: {
        userId: uuidv4(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
      },
    });

    const organisation = await prisma.organisation.create({
      data: {
        orgId: uuidv4(),
        name: `${firstName}'s Organisation`,
        description: '',
      },
    });

    await prisma.userOrganisation.create({
      data: {
        userId: user.userId,
        orgId: organisation.orgId,
      },
    });

    const accessToken = generateAccessToken(user);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(422).json({
      status: 'error',
      message: 'Registration unsuccessful',
      errors: [{ field: 'email', message: 'Email already exists' }],
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
        statusCode: 401,
      });
    }

    const accessToken = generateAccessToken(user);

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
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      statusCode: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = {
  registerUser,
  loginUser,
};

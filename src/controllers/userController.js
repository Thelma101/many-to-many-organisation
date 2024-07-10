const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: id },
      include: { userOrganisations: { include: { organisation: true } } }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        statusCode: 404
      });
    }

    const organisations = user.userOrganisations.map((userOrganisation) => ({
      orgId: userOrganisation.organisation.orgId,
      name: userOrganisation.organisation.name
    }));

    res.status(200).json({
      status: 'success',
      message: 'User found',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        organisations
      }
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

const createUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        userId: uuid.v4(),
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'User created',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      statusCode: 500
    });
  } finally {
    await prisma.$disconnect();
  }
};
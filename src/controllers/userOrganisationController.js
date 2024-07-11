const getUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const user = await prisma.user.findUnique({
      where: { userId: id },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }

    // Check if the user is in the same organisation
    const userOrganisation = await prisma.userOrganisation.findFirst({
      where: { userId: userId, organisationId: { equals: user.organisationId } },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User found',
      data: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const getOrganisations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const organisations = await prisma.userOrganisation.findMany({
      where: { userId },
      include: { organisation: true },
    });

    res.status(200).json({
      status: 'success',
      message: 'Organisations retrieved successfully',
      data: {
        organisations: organisations.map((uo) => uo.organisation),
      },
    });
  } catch (error) {
    console.error('Error fetching organisations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

const getOrganisationById = async (req, res) => {
  const { orgId } = req.params;
  const userId = req.user.userId;

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

    // Check if the user is in the same organisation
    const userOrganisation = await prisma.userOrganisation.findFirst({
      where: { userId, organisationId: orgId },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Organisation found',
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (error) {
    console.error('Error fetching organisation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

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
  }
};

module.exports = {
  getUser,
  getOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation,
};

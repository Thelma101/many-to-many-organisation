const request = require('supertest');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { app, server } = require('../src/app');
const authenticateJWT = require('../src/middleware/authenticateJWT');
const {
  getUserOrganisations,
  getOrganisationById,
  createOrganisation,
  addUserToOrganisation
} = require('../src/controllers/organisationController');

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'jwt_secret';

describe('Organisation Access Control', () => {
  let token;
  let userId;
  let orgId;

  beforeAll(async () => {
    const uuid = uuidv4().substring(0,8);
    // Create a test user
    const user = await prisma.user.create({
      data: {                 
        userId: uuid,
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.doe@example.com', 
        password: 'hashedPassword', 
        phone: '1234567890' 
      }
    });
    userId = user.userId;

    // Create a test organisation
    const organisation = await prisma.organisation.create({
      data: {
        orgId: 'testOrgId',
        name: 'Test Organisation',
        users: { create: [{ userId: userId }] }
      }
    });
    orgId = organisation.orgId;

    // Generate a token for the test user
    token = jwt.sign({ userId: userId }, secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany();
    await prisma.organisation.deleteMany();
    await prisma.$disconnect();
    await server.close();
  });

  it('should allow access to organisations the user belongs to', async () => {
    const response = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.organisations).toHaveLength(1);
    expect(response.body.data.organisations[0].orgId).toBe(orgId);
  });

  it('should not allow access to organisations the user does not belong to', async () => {
    const response = await request(app)
      .get('/api/organisations/invalidOrgId')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
});

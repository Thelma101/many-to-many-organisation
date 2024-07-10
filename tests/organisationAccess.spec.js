const request = require('supertest');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { app, server } = require('../src/app');
const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'jwt_secret';

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

describe('Organisation Access Control', () => {
  let token;
  let testUser;
  let testOrg;

  beforeAll(async () => {
    // Create a test user
    testUser = await prisma.user.create({
      data: {
        userId: '1046ada8',
        firstName: 'tee',
        lastName: 'Thelma',
        email: 'test.user@mail.com',
        password: '123', 
        phone: '1234567890'
      }
    });

    // Create a test organisation
    testOrg = await prisma.organisation.create({
      data: {
        orgId: '25ed99b2',
        name: 'Test Organisation',
        description: 'This is a test organisation.'
      }
    });

    // Generate a JWT token for authentication
    token = generateToken(testUser.userId);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { userId: testUser.userId } });
    await prisma.organisation.delete({ where: { orgId: testOrg.orgId } });
    await server.close();
    await prisma.$disconnect();
  });

  it('should fetch organisations for authenticated user', async () => {
    const response = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.organisations).toBeInstanceOf(Array);
  });

  it('should return 404 if no organisations found for user', async () => {
    await prisma.userOrganisation.deleteMany({ where: { userId: testUser.userId } });

    const response = await request(app)
      .get('/api/organisations')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No organisations found for the user');
  });

  it('should fetch a specific organisation by ID', async () => {
    const response = await request(app)
      .get(`/api/organisations/${testOrg.orgId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.organisation.orgId).toBe(testOrg.orgId);
  });

  it('should return 404 if organisation not found by ID', async () => {
    const response = await request(app)
      .get('/api/organisations/invalid_org_id')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Organisation not found');
  });

  it('should create a new organisation', async () => {
    const response = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Organisation',
        description: 'Organisation Description'
      });

    expect(response.status).toBe(201);
    expect(response.body.data.organisation).toHaveProperty('orgId');
  });

  it('should fail to create organisation with invalid data', async () => {
    const response = await request(app)
      .post('/api/organisations')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Organisation name is required and must be a non-empty string');
  });

  it('should add a user to an existing organisation', async () => {
    const newUser = await prisma.user.create({
      data: {
        userId: 'e34a646f',
        firstName: 'new',
        lastName: 'user',
        email: 'new.user@mail.com',
        password: '123', 
        phone: '1234567890'
      }
    });

    const response = await request(app)
      .post(`/api/organisations/${testOrg.orgId}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: newUser.userId });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User added to organisation successfully');
  });

  it('should fail to add user to organisation with invalid data', async () => {
    const response = await request(app)
      .post(`/api/organisations/${testOrg.orgId}/users`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User ID is required and must be a non-empty string');
  });
});

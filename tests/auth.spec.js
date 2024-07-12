const nock = require('nock');
const request = require('supertest');
const app = require('../src/app'); // Ensure this is your Express app
const { prisma } = require('./src/prismaClient'); // Ensure this is your Prisma client

// Mock Prisma client
const prismaClientMock = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  organisation: {
    create: jest.fn(),
  },
};

// Override the prisma client in your app with the mock
jest.mock('../src/prismaClient', () => ({
  prisma: prismaClientMock,
}));

// Helper function to mock JWT token generation
jest.mock('../src/utils/jwt', () => ({
  generateToken: () => 'accessToken',
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should fail when email is already in use', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email already in use');
    });

    it('should register a user successfully', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue(null);
      prismaClientMock.user.create.mockResolvedValue({ id: '1', userId: '123456', firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'hashedPassword', phone: '1234567890' });
      prismaClientMock.organisation.create.mockResolvedValue({ id: '1', name: "Test's Organisation" });

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.accessToken).toBe('accessToken');
      expect(response.body.data.user).toEqual({
        userId: '123456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
      });
      expect(response.body.data.organisation).toEqual({
        organisation: "Test's Organisation",
      });
    });

    it('should fail when password is invalid', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'hort',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Password must be at least 8 characters');
    });

    it('should fail when firstName is missing', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('First name is required');
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue({ id: '1', userId: '123456', firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'hashedPassword', phone: '1234567890' });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.accessToken).toBe('accessToken');
      expect(response.body.data.user).toEqual({
        userId: '123456',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '1234567890',
      });
    });

    it('should fail when email is invalid', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail when password is invalid', async () => {
      prismaClientMock.user.findUnique.mockResolvedValue({ id: '1', userId: '123456', firstName: 'Test', lastName: 'User', email: 'test@example.com', password: 'hashedPassword', phone: '1234567890' });

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail when email is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email is required');
    });

    it('should fail when password is missing', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Password is required');
    });
  });
});

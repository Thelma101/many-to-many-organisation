const express = require('express');
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = require('../src/app'); // Ensure this path is correct for your app
const server = express();
const prismaClientMock = new PrismaClient();

beforeAll(() => {
  server = app.listen(3001);
});

afterAll(() => {
  server.close();
});

const generateUniqueEmail = () => `testuser${Date.now()}@example.com`;
describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Register with existing email
  describe('POST /auth/register', () => {
    it('should fail when email is already in use', async () => {
      const existingEmail = generateUniqueEmail();
      prismaClientMock.user.findUnique.mockResolvedValue({ id: '1', email: existingEmail });

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: existingEmail,
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Email already in use');
    });

    // Test Case 2: Register successfully
    it('should register a user successfully', async () => {
      const newEmail = generateUniqueEmail();
      prismaClientMock.user.findUnique.mockResolvedValue(null);
      prismaClientMock.user.create.mockResolvedValue({
        id: '1',
        userId: '123456',
        firstName: 'Test',
        lastName: 'User',
        email: newEmail,
        password: 'hashedPassword',
        phone: '1234567890',
      });
      prismaClientMock.organisation.create.mockResolvedValue({ id: '1', name: "Test's Organisation" });
      bcrypt.hash.mockResolvedValue('hashedPassword');
      jwt.sign.mockReturnValue('accessToken');

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: newEmail,
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
        email: newEmail,
        phone: '1234567890',
      });
      expect(response.body.data.organisation).toEqual({
        organisation: "Test's Organisation",
      });
    });

    // Test Case 3: Register with invalid password
    it('should fail when password is invalid', async () => {
      const newEmail = generateUniqueEmail();
      prismaClientMock.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: newEmail,
          password: 'hort',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Password must be at least 8 characters');
    });

    // Test Case 4: Register with missing firstName
    it('should fail when firstName is missing', async () => {
      const newEmail = generateUniqueEmail();

      const response = await request(app)
        .post('/auth/register')
        .send({
          lastName: 'User',
          email: newEmail,
          password: 'password123',
          phone: '1234567890',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('First name is required');
    });
  });

  // Test Case 1: Login with valid credentials
  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const newEmail = generateUniqueEmail();
      prismaClientMock.user.findUnique.mockResolvedValue({
        id: '1',
        userId: '123456',
        firstName: 'Test',
        lastName: 'User',
        email: newEmail,
        password: 'hashedPassword',
        phone: '1234567890',
      });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('accessToken');

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: newEmail,
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
        email: newEmail,
        phone: '1234567890',
      });
    });

    // Test Case 2: Login with invalid email
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

    // Test Case 3: Login with invalid password
    it('should fail when password is invalid', async () => {
      const newEmail = generateUniqueEmail();
      prismaClientMock.user.findUnique.mockResolvedValue({
        id: '1',
        userId: '123456',
        firstName: 'Test',
        lastName: 'User',
        email: newEmail,
        password: 'hashedPassword',
        phone: '1234567890',
      });
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: newEmail,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid email or password');
    });

    // Test Case 4: Login with missing email
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

    // Test Case 5: Login with missing password
    it('should fail when password is missing', async () => {
      const newEmail = generateUniqueEmail();

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: newEmail,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Password is required');
    });
  });
});

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const request = require('supertest');
const app = require('../src/app'); // Adjust the path to your Express app
const prisma = new PrismaClient();

const secret = process.env.JWT_SECRET || 'jwt_secret';

describe('Token Generation', () => {
  it('should generate a token with correct user details and expiration', () => {
    const user = { userId: 'testUser' };
    const token = jwt.sign(user, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret);

    expect(decoded.userId).toBe('testUser');
    expect(decoded.exp).toBeDefined();
  });
});

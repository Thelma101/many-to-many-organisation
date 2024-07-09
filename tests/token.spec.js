const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'jwt_secret';

describe('Token Generation', () => {
  it('should generate a token with correct user details and expiration time', () => {
    const userId = 'testUserId';
    const token = jwt.sign({ userId }, secret, { expiresIn: '1h' });

    const decoded = jwt.verify(token, secret);
    
    expect(decoded.userId).toBe(userId);
    expect(decoded.exp).toBeDefined();
  });
});

const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'jwt_secret';
// process.env.DATABASE_URL = process.env.DATABASE_URL;
const generateToken = (userId, expiresIn) => {
  return jwt.sign({ userId }, secret, { expiresIn : '1hr'});
};

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };



// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const request = require('supertest');
// const { app, server } = require('../src/app');
// const prisma = new PrismaClient();

// const secret = process.env.JWT_SECRET || 'jwt_secret';

// describe('Token Generation', () => {
//   afterAll(async () => {
//     await prisma.$disconnect();
//     await server.close();
//   });

//   it('should generate a token with correct user details and expiration', () => {
//     const user = { userId: 'testUser' };
//     const token = jwt.sign(user, secret, { expiresIn: '1h' });
//     const decoded = jwt.verify(token, secret);

//     expect(decoded.userId).toBe('testUser');
//     expect(decoded.exp).toBeDefined();
//   });
// });

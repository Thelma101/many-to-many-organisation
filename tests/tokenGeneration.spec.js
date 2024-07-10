require('dotenv').config();
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateToken, verifyToken } = require('./tokenUtils');
const { v4: uuidv4 } = require('uuid');

describe('Token Utils', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should generate a token with correct user details', () => {
    const userId = uuidv4();
    const token = generateToken(userId, '1h');
    const decoded = verifyToken(token);

    expect(decoded.userId).toBe(userId);
  });

//   it('should expire the token at the correct time', async () => {
//     const userId = uuidv4();
//     const token = generateToken(userId, '1h');

//     await new Promise(resolve => setTimeout(resolve, 1500));
//     expect(() => verifyToken(token)).toThrow(jwt.TokenExpiredError);
//   });
// });

it('should expire the token at the correct time', async () => {
  const token = generateToken(userId);
  console.log(`Token expiration time: ${jwt.decode(token).exp * 1000}`); // Log the token expiration time

  await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for 1.5 seconds

  expect(() => verifyToken(token)).toThrow(jwt.TokenExpiredError);
});

// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const { generateToken, verifyToken } = require('./tokenUtils.spec.js')
// const { v4:uuidv4 } = require('uuid');

// describe('Token Utils', () => {
//   afterAll(async () => {
//     await prisma.$disconnect();
//   });

//   it('should generate a token with correct user details', () => {
//     const userId = uuidv4();
//     const token = generateToken(userId, '1h');
//     const decoded = verifyToken(token);

//     expect(decoded.userId).toBe(userId);
//   });

//   it('should expire the token at the correct time', (done) => {
//     const userId = uuidv4();
//     const token = generateToken(userId, '1h');
    
//     setTimeout(() => {
//       expect(() => verifyToken(token)).toThrow(jwt.TokenExpiredError);
//       done();
//     }, 1500);
//   });
// });



// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const secret = process.env.JWT_SECRET || 'jwt_secret';
// const { generateToken, verifyToken } = require('../tokenGeneration');

// describe('Token Utils', () => {
//   it('should generate a token with correct user details', () => {
//     const userId = '123';
//     const token = generateToken(userId, '1h');
//     const decoded = verifyToken(token);

//     expect(decoded.userId).toBe(userId);
//   });

//   it('should expire the token at the correct time', () => {
//     const userId = '123';
//     const token = generateToken(userId, '1s');
//     setTimeout(() => {
//       expect(() => verifyToken(token)).toThrow();
//     }, 1500);
//   });
// });

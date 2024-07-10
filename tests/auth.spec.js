// const { app } = require('../src/app');
const app = require('../src/app');
const request = supertest(app);
// const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let server;

beforeAll((done) => {
    server = app.listen(done);
});

afterAll((done) => {
    server.close(done);
});


describe('User Registration', () => {
  afterEach(async () => {
    // await app.close();
    await prisma.$disconnect();
  });


  it('should register user successfully with default organisation', async () => {
    const email = `tee.thelma${Math.random()}@mail.com`;
    const response = await request
      .post('/auth/register')
      .send({
        firstName: 'tee',
        lastName: 'thelma',
        email,
        password: '123',
        phone: '1234567890',
      });

    console.log(response.body); // Log the response body for debugging

    expect(response.status).toBe(201);
    expect(response.body.data.user.firstName).toBe('tee');
    expect(response.body.data.user.lastName).toBe('thelma');
    expect(response.body.data.user.email).toBe(email);
    expect(response.body.data.user).toHaveProperty('userId');
    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('should fail if required fields are missing', async () => {
    const response = await request
      .post('/auth/register')
      .send({
        firstName: 'tee',
        email: `tee.thelma${Math.random()}@mail.com`,
        password: '123',
        phone: '1234567890',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'lastName' }),
      ])
    );
  });

  it('should fail if there is a duplicate email', async () => {
    const uniqueEmail = `unique${Date.now()}@mail.com`;
    await request.post('/auth/register').send({
      firstName: 'tee',
      lastName: 'thelma',
      email: uniqueEmail,
      password: '123',
      phone: '1234567890',
    });

    const response = await request
      .post('/auth/register')
      .send({
        firstName: 'Thelma',
        lastName: 'Akpata',
        email: uniqueEmail,
        password: '123',
        phone: '0987654321',
      });

    console.log(response.body); // Log the response body for debugging

    expect(response.status).toBe(400); // Updated to match your controller
    expect(response.body.message).toBe('Email already in use');
  });
});



// const request = require('supertest');
// const app = require('../src/app');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const jwt = require('jsonwebtoken');
// const { v4: uuidv4 } = require('uuid');

// describe('User Registration', () => {
//   afterEach(async () => {
//     await prisma.$disconnect();
//   });

//   it('should register user successfully with default organisation', async () => {
//     const email = `tee.thelma${Math.random()}@mail.com`;
//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'tee',
//         lastName: 'thelma',
//         email,
//         password: '123',
//         phone: '1234567890',
//       });
  
//     console.log(response.body);
  
//     expect(response.status).toBe(201);
//     expect(response.body.data.user).toHaveProperty('userId');
//     expect(response.body.data.user.firstName).toBe('tee');
//     expect(response.body.data.user.lastName).toBe('thelma');
//     expect(response.body.data.user.email).toBe(email);
//     expect(response.body.data.user.phone).toBe(phone);
//     expect(response.body.data).toHaveProperty('accessToken');
//   });

//   it('should fail if required fields are missing', async () => {
//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'tee',
//         email: `tee.thelma${Math.random()}@mail.com`,
//         password: '123',
//         phone: '1234567890',
//       });

//     expect(response.status).toBe(422);
//     expect(response.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: 'lastName' }),
//       ])
//     );
//   });

//   it('should fail if there is a duplicate email', async () => {
//     const uniqueEmail = `unique${Date.now()}@mail.com`;
//     await request(app).post('/auth/register').send({
//       firstName: 'tee',
//       lastName: 'thelma',
//       email: uniqueEmail,
//       password: '123',
//       phone: '1234567890',
//     });

//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'Thelma',
//         lastName: 'Akpata',
//         email: uniqueEmail,
//         password: '123',
//         phone: '0987654321',
//       });

//     expect(response.status).toBe(422);
//     expect(response.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: 'email' }),
//       ])
//     );
//   });
// });



// const request = require('supertest');
// const { app, server } = require('../src/app');

// describe('User Registration', () => {
//   afterAll(async () => {
//     await server.close();
//   });

//   it('should register user successfully with default organisation', async () => {
//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'tee',
//         lastName: 'thelma',
//         email: 'tee.thelma@mail.com',
//         password: 'password',
//         phone: '1234567890',
//       });

//     expect(response.status).toBe(201);
//     expect(response.body.data.user.firstName).toBe('tee');
//     expect(response.body.data.user.email).toBe('tee.thelma@mail.com');
//     expect(response.body.data.user).toHaveProperty('userId');
//     expect(response.body.data).toHaveProperty('accessToken');
//   });

//   it('should fail if required fields are missing', async () => {
//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'tee',
//         email: 'tee.thelma@mail.com',
//         password: 'password',
//         phone: '15678998765',
//       });

//     expect(response.status).toBe(422);
//     expect(response.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: 'lastName' }),
//       ])
//     );
//   });

//   it('should fail if there is a duplicate email', async () => {
//     await request(app).post('/auth/register').send({
//       firstName: 'tee',
//       lastName: 'thelma',
//       email: 'tee.thelma@mail.com',
//       password: 'password',
//       phone: '1234567890',
//     });

//     const response = await request(app)
//       .post('/auth/register')
//       .send({
//         firstName: 'Jane',
//         lastName: 'thelma',
//         email: 'tee.thelma@mail.com',
//         password: 'password',
//         phone: '0987654321',
//       });

//     expect(response.status).toBe(422);
//     expect(response.body.errors).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({ field: 'email' }),
//       ])
//     );
//   });
// });

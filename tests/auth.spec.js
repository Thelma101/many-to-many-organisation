const request = require('supertest');
const { app, server } = require('../src/app');

describe('User Registration', () => {
  afterAll(async () => {
    await server.close();
  });

  it('should register user successfully with default organisation', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'tee',
        lastName: 'thelma',
        email: 'tee.thelma@mail.com',
        password: 'password',
        phone: '1234567890',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.user.firstName).toBe('tee');
    expect(response.body.data.user.email).toBe('tee.thelma@mail.com');
    expect(response.body.data.user).toHaveProperty('userId');
    expect(response.body.data).toHaveProperty('accessToken');
  });

  it('should fail if required fields are missing', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'tee',
        email: 'tee.thelma@mail.com',
        password: 'password',
        phone: '15678998765',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'lastName' }),
      ])
    );
  });

  it('should fail if there is a duplicate email', async () => {
    await request(app).post('/auth/register').send({
      firstName: 'tee',
      lastName: 'thelma',
      email: 'tee.thelma@mail.com',
      password: 'password',
      phone: '1234567890',
    });

    const response = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'thelma',
        email: 'tee.thelma@mail.com',
        password: 'password',
        phone: '0987654321',
      });

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
      ])
    );
  });
});

const request = require('supertest');
const express = require('express');
const { registerUser, loginUser } = require('../src/controllers/authController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

app.post('/auth/register', registerUser);
app.post('/auth/login', loginUser);

jest.mock('@prisma/client');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthController', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully with a default organisation', async () => {
            const mockUser = {
                userId: 'testUserId',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'hashedpassword',
                phone: '1234567890'
            };

            const mockOrganisation = {
                name: "John's Organisation"
            };

            prisma.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedpassword');
            prisma.user.create.mockResolvedValue(mockUser);
            prisma.organisation.create.mockResolvedValue(mockOrganisation);
            jwt.sign.mockReturnValue('mockedToken');

            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123',
                    phone: '1234567890'
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Registration successful');
            expect(response.body.data.user.email).toBe('john.doe@example.com');
            expect(response.body.data.organisation.organisation).toBe("John's Organisation");
        });

        it('should fail when required fields are missing', async () => {
            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    email: 'john.doe@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('Bad request');
            expect(response.body.message).toBe('Registration unsuccessful');
        });

        it('should fail when email is already in use', async () => {
            prisma.user.findUnique.mockResolvedValue({ email: 'john.doe@example.com' });

            const response = await request(app)
                .post('/auth/register')
                .send({
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123',
                    phone: '1234567890'
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Email already in use');
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                userId: 'testUserId',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'hashedpassword',
                phone: '1234567890'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mockedToken');

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.message).toBe('Login successful');
            expect(response.body.data.user.email).toBe('john.doe@example.com');
        });

        it('should fail with invalid email', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'invalid@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Invalid email or password');
        });

        it('should fail with invalid password', async () => {
            const mockUser = {
                userId: 'testUserId',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: 'hashedpassword',
                phone: '1234567890'
            };

            prisma.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'john.doe@example.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.status).toBe('error');
            expect(response.body.message).toBe('Invalid email or password');
        });
    });
});

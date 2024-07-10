require('dotenv').config();
const supertest = require('supertest');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { app, server } = require('./src/app');

process.env.PORT = 4000;

beforeAll(async () => {
  process.env.DATABASE_URL = process.env.DATABASE_URL;
  await prisma.$connect();
});

afterAll(async () => {
  await server.close();
  await prisma.$disconnect();
});

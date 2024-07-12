const request = require('supertest');
const { createOrganisation } = require('../src/controllers/userController');
const { getOrganisations, getOrganisationId, addUserToOrganisation } = require('../src/controllers/organisationController');


const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client');

describe('addUserToOrganisation', () => {
    let req;
    let res;
    let prisma;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            user: {},
        };
        res = {
            status: jest.fn(() => res),
            json: jest.fn(() => res),
        };
        prisma = new PrismaClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    //   CREATE ORG

    describe('createOrganisation', () => {
        it('should create organisation successfully', async () => {
            req.body = { name: 'Test Organisation', description: 'Test description' };
            prisma.organisation.create.mockResolvedValue({ orgId: 'testOrgId' });

            await createOrganisation(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    message: 'Organisation created successfully',
                    data: { organisation: { orgId: 'testOrgId' } },
                })
            );
        });
    });

    describe('error', () => {
        it('should return 422 if name is missing', async () => {
            req.body = { description: 'Test description' };

            await createOrganisation(req, res);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: 'Name is required',
                })
            );
        });
    });


    // GET ORG BY USERID
    describe('getOrganisations', () => {
        it('should return organisations successfully', async () => {
            req.user = { userId: 'testUserId' };
            prisma.organisation.findMany.mockResolvedValue([{ orgId: 'testOrgId1' }, { orgId: 'testOrgId2' }]);

            await getOrganisations(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    message: 'Organisations fetched successfully',
                    data: { organisations: [{ orgId: 'testOrgId1' }, { orgId: 'testOrgId2' }] },
                })
            );
        });
    });

    describe('error', () => {
        it('should return 404 if no organisations found', async () => {
            req.user = { userId: 'testUserId' };
            prisma.organisation.findMany.mockResolvedValue([]);

            await getOrganisations(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: 'No organisations found for the user',
                })
            );
        });
    });
});

// GET ORG ID
describe('getOrganisationId', () => {
    describe('success', () => {
        it('should return organisation by id successfully', async () => {
            req.params = { id: 'testOrgId' };
            prisma.organisation.findUnique.mockResolvedValue({ orgId: 'testOrgId', name: 'Test Organisation' });

            await getOrganisationId(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'success',
                    message: 'Organisation found',
                    data: { orgId: 'testOrgId', name: 'Test Organisation' },
                })
            );
        });
    });

    describe('error', () => {
        it('should return 404 if organisation not found', async () => {
            req.params = { id: 'testOrgId' };
            prisma.organisation.findUnique.mockResolvedValue(null);

            await getOrganisationId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'error',
                    message: 'Organisation not found',
                })
            );
        });
    });
});

// ADD USER TO ORG
describe('addUserToOrganisation', () => {
    describe('success', () => {
        it('should add user to organisation successfully', async () => {
            req.params = { orgId: 'testOrgId' };
            req.body = { userId: 'testUserId' };
            prisma.organisation.findUnique.mockResolvedValue({ orgId: 'testOrgId' });
            prisma.user.findUnique.mockResolvedValue(null);

            await addUserToOrganisation(req, res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'User not found',
            });
        });

        it('should return 500 on internal server error', async () => {
            prisma.organisation.findUnique.mockRejectedValue(new Error('Database error'));

            await addUserToOrganisation(req, res);

            expect(res.status).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalledWith({
                status: 'error',
                message: 'Internal server error',
            });
        });
    })
});

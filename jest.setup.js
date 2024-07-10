require('dotenv').config();
// const { app, server } = require('./src/app');

process.env.PORT = 4000;
beforeAll(async () => {

    const DATABASE_URL = process.env.DATABASE_URL;

    const { server } = require('./src/app');

    afterAll(async () => {
        await server.close();
    });

});


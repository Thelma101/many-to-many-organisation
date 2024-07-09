const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const secret = process.env.JWT_SECRET || 'jwt_secret';

const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication token required',
            statusCode: 401
        });
    }

    jwt.verify(token, secret, async (err, decoded) => {
        if (err) {
            // Handle token expiration error separately
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token expired',
                    statusCode: 401
                });
            }
            // For other verification errors (e.g., invalid token)
            return res.status(403).json({
                status: 'error',
                message: 'Forbidden',
                statusCode: 403
            });
        }
        
        try {
            const user = await prisma.user.findUnique({
                where: { userId: decoded.userId }
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                    statusCode: 404
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Error during authentication:', error);
            return res.status(500).json({
                status: 'error',
                message: 'Internal server error',
                statusCode: 500
            });
        } finally {
            await prisma.$disconnect(); 
        }
    });
};

module.exports = authenticateJWT;



// const jwt = require('jsonwebtoken');
// // const jwt = require('jsonwebtoken');
// // const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const secret = process.env.JWT_SECRET || 'jwt_secret';

// const authenticateJWT = async (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({
//             status: 'error',
//             message: 'Authentication token required',
//             statusCode: 401
//         });
//     }

//     jwt.verify(token, secret, async (err, decoded) => {
//         if (err) {
//             return res.status(403).json({
//                 status: 'error',
//                 message: 'Forbidden',
//                 statusCode: 403
//             });
//         }
        
//         try {
//             const user = await prisma.user.findUnique({
//                 where: { userId: decoded.userId }
//             });

//             if (!user) {
//                 return res.status(404).json({
//                     status: 'error',
//                     message: 'User not found',
//                     statusCode: 404
//                 });
//             }

//             req.user = user;
//             next();
//         } catch (error) {
//             console.error('Error during authentication:', error);
//             return res.status(500).json({
//                 status: 'error',
//                 message: 'Internal server error',
//                 statusCode: 500
//             });
//         } finally {
//             await prisma.$disconnect(); 
        
//         }
//     });
// };

// module.exports = authenticateJWT;


// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const secret = 'your_jwt_secret'; // Replace with your actual secret key

// const authenticateJWT = async (req, res, next) => {
//     try {
//         const authHeader = req.headers['authorization'];
//         const token = authHeader && authHeader.split(' ')[1];

//         if (!token) {
//             return res.status(401).json({
//                 status: 'error',
//                 message: 'Authentication token required',
//                 statusCode: 401
//             });
//         }

//         const decoded = jwt.verify(token, secret);
//         const user = await prisma.user.findUnique({
//             where: { userId: decoded.userId }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found',
//                 statusCode: 404
//             });
//         }

//         req.user = user;
//         next();
//     } catch (error) {
//         console.error('Error during authentication:', error);
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({
//                 status: 'error',
//                 message: 'Invalid token',
//                 statusCode: 401
//             });
//         } else if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 status: 'error',
//                 message: 'Token expired',
//                 statusCode: 401
//             });
//         } else {
//             return res.status(500).json({
//                 status: 'error',
//                 message: 'Internal server error',
//                 statusCode: 500
//             });
//         }
//     }
// };

// module.exports = authenticateJWT;


// const jwt = require('jsonwebtoken');
// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();
// const secret = 'your_jwt_secret'; // Replace with your actual secret key

// const authenticateJWT = (req, res, next) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({
//             status: 'error',
//             message: 'Authentication token required',
//             statusCode: 401
//         });
//     }

//     jwt.verify(token, secret, async (err, decoded) => {
//         if (err) {
//             return res.status(403).json({
//                 status: 'error',
//                 message: 'Forbidden',
//                 statusCode: 403
//             });
//         }
        
//         const user = await prisma.user.findUnique({
//             where: { userId: decoded.userId }
//         });

//         if (!user) {
//             return res.status(404).json({
//                 status: 'error',
//                 message: 'User not found',
//                 statusCode: 404
//             });
//         }

//         req.user = user;
//         next();
//     });
// };

// module.exports = authenticateJWT;

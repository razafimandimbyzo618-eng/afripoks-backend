const jwt = require('jsonwebtoken');
const User = require('../model/User');
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
    
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(" ")[1];
            
            if (!token) {
                console.log("No token found after Bearer prefix");
                res.status(401);
                throw new Error("Not authorized, no token");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findOne({
                where: { id: decoded.id },
                attributes: { exclude: ['password'] }
              });

            if (!req.user) {
                console.log(`User not found for id: ${decoded.id}`);
                res.status(401);
                throw new Error("Not authorized, user not found");
            }

            return next();
        } catch(err) {
            console.log("Token verification failed:", err.message);
            res.status(401);
            throw new Error("Not authorized, token failed");
        }
    }

    if(!token) {
        console.log("No Authorization header or does not start with Bearer");
        res.status(401);
        throw new Error("Not authorized");
    }
});

module.exports = protect;
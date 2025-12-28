import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; 
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : null;
        
        if (!token) {
            return res.status(401).json({ 
                message: "Access denied. No token provided.",
                success: false 
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET not found in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select('-password'); 
        
        if (!user) {
            return res.status(401).json({ 
                message: "Invalid token. User not found.",
                success: false 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message); 
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token format',
                success: false 
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expired. Please login again',
                success: false 
            });
        }
        
        res.status(401).json({ 
            message: 'Token is not valid',
            success: false 
        });
    }
};

export { authMiddleware }; 

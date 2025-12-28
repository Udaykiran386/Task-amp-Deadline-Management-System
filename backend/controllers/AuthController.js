import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerAuth =async (req, res) => {
    try {
        const {userName, password,email,role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({message: 'User already exists'});
        }
        const user = new User({
            userName,
            email,
            password: hashedPassword,
            role,
        });
        await user.save();
        res.status(201).json({message: 'User registered successfully', user:{id:user._id,userName:user.userName,email:user.email,role:user.role}});
    } catch (error) {
        console.error('Error in registerAuth:', error);
        res.status(500).json({message: 'Internal server error'});
    }
};

const loginAuth = async (req, res) => {
    try {
        const {email,password } = req.body;
        const user = await User.findOne({email});
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({message: 'Invalid credentials'});
        }
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        res.status(200).json({token,user:{id:user._id,userName:user.userName,email:user.email,role:user.role}});
    } catch (error) {
        console.error('Error in loginAuth:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

const getMe = async (req, res) => {
    try {
        const user = {
            id: req.user._id,
            userName: req.user.userName,
            email: req.user.email,
            role: req.user.role
        };
        res.json({ user });
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({message: 'Internal server error'});
    }
};  

export {registerAuth,loginAuth,getMe};
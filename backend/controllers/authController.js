// backend/controllers/authController.js

import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Ro'yxatdan o'tish
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Bu email allaqachon mavjud' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Foydalanuvchi ma\'lumotlari noto\'g\'ri' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server xatoligi' });
    }
};

// Tizimga kirish
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Email yoki parol xato' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server xatoligi' });
    }
};

// Google bilan kirish
export const googleLogin = async (req, res) => {
    // Bu qismni avvalgi javoblardan olib, to'ldirishingiz mumkin
    // Hozircha bo'sh qoldiramiz, xatolik bermasligi uchun
    res.status(200).json({ message: "Google login is under construction" });
};


// JWT Token yaratish funksiyasi
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};
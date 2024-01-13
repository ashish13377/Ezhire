const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/user');
require('dotenv').config(); // Load environment variables

// Generate a random 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const signup = async (req, res) => {
    try {
        const { email, password, phone, firstName, lastName } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ email, password: hashedPassword, phone, firstName, lastName });
        await newUser.save();

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find the user by email
        const user = await User.findOne({ email });


        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '30d' });

        res.status(200).json({ token: token, userData: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    } 
};



const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a random 6-digit OTP
        const otp = generateOTP();

        // Hash the OTP and store it in the user's data
        const hashedOTP = await bcrypt.hash(otp, 10);
        user.verificationOTP = hashedOTP;
        user.verificationOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
        await user.save();

        // Send the OTP via email
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 465,
            secure: true,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the OTP is valid and not expired
        if (user.verificationOTP !== otp || user.verificationOTPExpiry < new Date()) {
            return res.status(401).json({ message: 'Invalid or expired OTP' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password and reset the OTP
        user.password = hashedPassword;
        user.verificationOTP = undefined;
        user.verificationOTPExpiry = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


const authenticateToken = (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

const getUserData = async (req, res) => {
    try {
        const userData = await User.findById(req.user.userId);
        res.status(200).json({ userData: userData });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword,
    authenticateToken,
    getUserData
};

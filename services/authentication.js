const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const asyncHandler = require('express-async-handler');
const Agent = require('../models/agent'); // Import Agent model 
const {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} = require('../configs/authTokenSecrets'); 

// Login
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const foundAgent = await Agent.findOne({ email });

        if (!foundAgent) {
            return res.status(401).json({ message: "Unauthorized. Agent doesn't exist" });
        }

        const passwordMatched = await bcrypt.compare(password, foundAgent.password);

        if (!passwordMatched) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const accessToken = generateAccessToken(foundAgent);
        const refreshToken = generateRefreshToken(foundAgent);

        // Set refresh token as cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiry
        });

        res.json({ accessToken });
    } catch (error) {
        console.error(`Error logging in: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Signup
const signUp = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required!" });
        }

        const foundAgent = await Agent.findOne({ email });

        if (foundAgent) {
            return res.status(401).json({ message: "Agent already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAgent = await Agent.create({
            name,
            email,
            password: hashedPassword
        });

        const accessToken = generateAccessToken(newAgent);
        const refreshToken = generateRefreshToken(newAgent);

        // Set refresh token as cookie
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days expiry
        });

        res.json({ accessToken });
    } catch (error) {
        console.error(`Error signing up: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Refresh Token
const refresh = asyncHandler(async (req, res, next) => {
    try {
        const refreshToken = req.cookies.jwt;

        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized. No refresh token found" });
        }

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden. Invalid refresh token" });
            }

            const foundAgent = await Agent.findOne({ email: decoded.email });

            if (!foundAgent) {
                return res.status(401).json({ message: 'Unauthorized. Agent not found' });
            }

            const accessToken = generateAccessToken(foundAgent);

            res.json({ accessToken });
        });
    } catch (error) {
        console.error(`Error refreshing token: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Logout
const logout = asyncHandler(async (req, res, next) => {
    try {
        res.clearCookie('jwt');

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error(`Error logging out: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Function to generate access token
function generateAccessToken(agent) {
    return jwt.sign(
        {
            userInfo: {
                email: agent.email,
                name: agent.name
            }
        },
        ACCESS_TOKEN_SECRET,
        {
            expiresIn: '2d'
        }
    );
}


// Function to generate refresh token
function generateRefreshToken(agent) {
    return jwt.sign(
        {
            userInfo: {
                email: agent.email,
                name: agent.name
            }
        },
        REFRESH_TOKEN_SECRET,
        {
            expiresIn: '7d'
        }
    );
}

module.exports = {
    login,
    signUp,
    refresh,
    logout
};

const jwt = require('jsonwebtoken');
require('dotenv').config();
const Agent = require('../models/agent');



const verifyJWT = (req, res, next) => {

    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')){
       return res.status(401).json({message: "Unauthorized"});
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, decode) => {

            try {

                if(err) return res.status(403).json({message: "forbidden"})

                const user = Agent.findOne({email: decode.userInfo.email})
                
                if(!accessToken) return res.status(403).json({message: "forbidden"})
                
                req.accessToken = user.accessToken;
                req.name = decode.userInfo.name;
                req.email = decode.userInfo.email;
                next();
                
            } catch (error) {
                console.error(`Error verifying jwt: ${error.message}`);
                res.status(500).json({ message: "Internal Server Error" });
            }
        }
    )
}

module.exports = verifyJWT;
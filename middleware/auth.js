const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next) => {
    const token = req.header("token");

    if(!token){
        return res.status(401).json({error: "token not present"})
    }

    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        next();
    } catch (error) {
        return res.status(401).json({error: "invalid token"})
    }
}

module.exports = authMiddleware
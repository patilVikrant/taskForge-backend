const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get auth header from req
    const authHeader = req.header("Authorization");

    // Check if token is present
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // get the token
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. Invalid token format." });
    }

    // verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // attach decoded info to request object
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const includeAuthorization = (headers) => {
  if (!headers.authorization) {
    return false;
  }
  return true;
};

const getAccessTokenFrom = (headers) => {
  return headers.authorization.split(" ")[1];
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

const authUser = (permissions) => {
  return (req, res, next) => {
    const headers = req.headers;
    if (!includeAuthorization(headers)) {
      res.status(401).json({ error: "No token!" });
      return;
    }
    const token = getAccessTokenFrom(headers);
    try {
      const result = verifyToken(token, secret);
      const { id, role, email } = result;
      if (permissions.includes(role)) {
        req.body.user_id = id;
        req.body.email = email;
        next();
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      return;
    } catch {
      res.status(403).json({ error: "Invalid token!" });
      return;
    }
  };
};

module.exports = { authUser };

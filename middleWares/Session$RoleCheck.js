import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
   if (req.method === "OPTIONS") {
      return next();
   }
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Not Login (Token ?)" });

  const token = authHeader.split(" ")[1]; 
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json("Token invalid");
    req.user = decoded; 
    next();
  });
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next();
    }
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json("Access Denied");
    }
    next();
  };
};


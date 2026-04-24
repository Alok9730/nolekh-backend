import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  if (req.method === "OPTIONS") return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized - No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (req.method === "OPTIONS") return next();

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};
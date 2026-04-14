import jwt from 'jsonwebtoken';

export const validateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'Server misconfiguration: JWT_SECRET is not set.' });

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // expects { userId: string, collegeName: string }
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

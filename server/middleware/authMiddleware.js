import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      res.status(401);
      throw new Error('Not authorized — no session token found');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized — user no longer exists');
    }

    next();
  } catch (error) {
    res.status(401);
    next(new Error('Not authorized — invalid or expired token'));
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  next(new Error('Access denied — Admin privileges required'));
};

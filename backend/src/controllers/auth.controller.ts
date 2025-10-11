import { Request, Response, NextFunction } from "express";
import { createToken, verifyToken } from "../services/jwt.service";
import bcrypt from "bcryptjs";
import { IUser } from "../types/user.type";
import User from "../db/models/user.model";

// Login endpoint - POST /api/auth/login
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, phone_number } = req.body;

    if ((!email && !phone_number) || !password) {
      res.status(400).json({ 
        message: "Email or phone number and password are required." 
      });
      return;
    }

    const query = email ? { email } : { phone_number };
    const user: IUser | null = await User.findOne(query);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    let token;
    if (user._id) token = createToken(user._id);

    const expires_in = 3600; // 1 hour in seconds

    res.status(200).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        role: user.role
      },
      expires_in
    });
  } catch (error) {
    next(error);
  }
};

// Logout endpoint - POST /api/auth/logout
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can still return a success message
    res.status(200).json({
      message: "Successfully logged out"
    });
  } catch (error) {
    next(error);
  }
};

// Verify endpoint - GET /api/auth/verify
export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ 
        user: null, 
        valid: false 
      });
      return;
    }

    const decoded = verifyToken(token);
    
    if (!decoded.userId) {
      res.status(401).json({ 
        user: null, 
        valid: false 
      });
      return;
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ 
        user: null, 
        valid: false 
      });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        role: user.role
      },
      valid: true
    });
  } catch (error) {
    res.status(401).json({ 
      user: null, 
      valid: false 
    });
  }
};

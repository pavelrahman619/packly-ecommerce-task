import { NextFunction, Request, Response } from "express";
import User from "../db/models/user.model";
import bcrypt from "bcryptjs";
import { createToken } from "../services/jwt.service";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = "1", limit = "10", role } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    let query: any = {};
    if (role) {
      query.role = role;
    }

    const [users, totalCount] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip(skip)
        .limit(limitNumber)
        .sort({ created_at: -1 }),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber);

    res.json({
      users,
      pagination: {
        current_page: pageNumber,
        total_pages: totalPages,
        total_count: totalCount,
        has_next: pageNumber < totalPages,
        has_prev: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role, password, email, phone_number } = req.body;

    // Validate required fields
    if (!password) {
      res.status(400).json({ message: "Password is required." });
      return;
    }

    if (!email && !phone_number) {
      res
        .status(400)
        .json({ message: "Either email or phone number is required." });
      return;
    }

    let hashedPassword = "";
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const validRoles = ["admin", "regular", "super_admin"];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role provided." });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone_number ? [{ phone_number }] : []),
      ],
    });

    if (existingUser) {
      res
        .status(409)
        .json({
          message: "User already exists with this email or phone number.",
        });
      return;
    }

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      role: role || "regular",
    });

    if (newUser) {
      const token = createToken(newUser?._id as string);

      // Don't send password in response
      const userResponse = {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: newUser.role,
      };

      res.status(201).json({
        message: "User created successfully.",
        user: userResponse,
        token: token,
      });
    } else {
      res.status(500).json({ message: "Failed to create user." });
    }
  } catch (error) {
    console.error("Error in createUser:", error);
    next(error);
  }
};

export const editUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    // Remove sensitive fields from update
    const { password, ...updateData } = req.body;

    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (updated) {
      res.status(200).json(updated);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const deleted = await User.deleteOne({
      _id: id,
    });
    if (deleted) {
      res.status(204).send(); // No content
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    next(error);
  }
};

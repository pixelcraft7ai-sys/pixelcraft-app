import { Router, Request, Response } from "express";
import { registerUser, loginUser, changePassword, getUserById } from "../auth";
import { z } from "zod";
import * as jwt from "jose";

const router = Router();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret_min_32_characters_long");

// Register
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await registerUser({ email, password, name });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    return res.json({ success: true, userId: result.userId });
  } catch (error) {
    console.error("[Auth API] Signup failed:", error);
    return res.status(500).json({ message: "Signup failed" });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const result = await loginUser({ email, password });

    if (!result.success) {
      return res.status(401).json({ message: result.error });
    }

    // Create JWT token
    const token = await new jwt.SignJWT({ userId: result.user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      user: result.user,
      token,
    });
  } catch (error) {
    console.error("[Auth API] Login failed:", error);
    return res.status(500).json({ message: "Login failed" });
  }
});

// Change Password
router.post("/change-password", async (req: Request, res: Response) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const verified = await jwt.jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).userId;

    const { oldPassword, newPassword } = req.body;
    const result = await changePassword(userId, oldPassword, newPassword);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("[Auth API] Change password failed:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

// Logout
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie("auth_token");
  return res.json({ success: true });
});

export default router;

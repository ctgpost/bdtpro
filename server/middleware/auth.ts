import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../database/models";

const JWT_SECRET = process.env.JWT_SECRET || "bd_ticket_pro_secret";
const TOKEN_EXPIRY = "7d";

export function generateToken(user: any) {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export const authenticate: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.get("Authorization") || req.get("authorization");
    if (!authHeader) return res.status(401).json({ success: false, message: "Authorization header missing" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ success: false, message: "Invalid authorization header" });

    const token = parts[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }

    if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: "Invalid token payload" });

    const user = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default { generateToken, authenticate };

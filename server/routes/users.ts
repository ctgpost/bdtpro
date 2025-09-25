import { Router, Request, Response } from "express";
import { UserRepository } from "../database/models";

const router = Router();

// List users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await UserRepository.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create user (admin)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, password, name, email, phone, role = "staff", status = "active" } = req.body;
    const user = await UserRepository.create({ username, password, name, email, phone, role, status });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { query } from "../database/schema";

const router = Router();

// Get umrah group tickets
router.get("/group-tickets", async (req: Request, res: Response) => {
  try {
    const { packageType, limit = 50, offset = 0 } = req.query as any;
    const q = `SELECT g.*, p.name as package_name FROM umrah_group_tickets g JOIN umrah_packages p ON g.package_id = p.id ORDER BY g.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching umrah group tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create umrah group ticket
router.post("/group-tickets", async (req: Request, res: Response) => {
  try {
    const { package_id, ticket_count } = req.body;
    const result = await query(`INSERT INTO umrah_group_tickets (package_id, ticket_count, available_count, sold_count) VALUES ($1, $2, $2, 0) RETURNING *`, [package_id, ticket_count]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating umrah group ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

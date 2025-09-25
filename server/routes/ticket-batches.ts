import { Router, Request, Response } from "express";
import { TicketRepository } from "../database/models";

const router = Router();

// Get ticket batches
router.get("/", async (req: Request, res: Response) => {
  try {
    const { country, airline, dateFrom, dateTo, limit = 50, offset = 0 } = req.query as any;

    // Simple listing from DB
    const q = `SELECT tb.* FROM ticket_batches tb WHERE 1=1
      ${country ? "AND tb.country_id = (SELECT id FROM countries WHERE code = $3)" : ""}
      ORDER BY tb.created_at DESC LIMIT $1 OFFSET $2`;

    // If country filter is provided we perform a parameterized query; otherwise basic query
    if (country) {
      const result = await (await import("../database/schema")).query(`SELECT tb.* FROM ticket_batches tb JOIN countries c ON tb.country_id = c.id WHERE c.code = $1 ORDER BY tb.created_at DESC LIMIT $2 OFFSET $3`, [country, Number(limit), Number(offset)]);
      return res.json({ success: true, data: result.rows });
    }

    const result = await (await import("../database/schema")).query(`SELECT tb.* FROM ticket_batches tb ORDER BY tb.created_at DESC LIMIT $1 OFFSET $2`, [Number(limit), Number(offset)]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching ticket batches:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create ticket batch
router.post("/", async (req: Request, res: Response) => {
  try {
    const batchData = req.body;
    const batch = await TicketRepository.createBatch(batchData);
    res.json({ success: true, data: batch });
  } catch (error) {
    console.error("Error creating ticket batch:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

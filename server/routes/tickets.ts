import { Router, Request, Response } from "express";
import { TicketRepository } from "../database/models";
import { query } from "../database/schema";

const router = Router();

// Dashboard stats (lightweight)
router.get("/dashboard/stats", async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT
      (SELECT COUNT(*) FROM tickets) AS total_tickets,
      (SELECT COUNT(*) FROM bookings) AS total_bookings,
      (SELECT COUNT(*) FROM tickets WHERE status = 'locked') AS locked_tickets
    `);

    const row = result.rows[0] || { total_tickets: 0, total_bookings: 0, locked_tickets: 0 };

    res.json({ success: true, data: {
      totalInventory: Number(row.total_tickets || 0),
      totalBookings: Number(row.total_bookings || 0),
      lockedTickets: Number(row.locked_tickets || 0),
    }});
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Countries stats (basic)
router.get("/countries/stats", async (_req: Request, res: Response) => {
  try {
    const result = await query(`SELECT c.code, c.name, COUNT(t.id) AS available_tickets
      FROM countries c
      LEFT JOIN ticket_batches tb ON tb.country_id = c.id
      LEFT JOIN tickets t ON t.batch_id = tb.id AND t.status = 'available'
      GROUP BY c.code, c.name ORDER BY c.name`);

    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error("Error fetching countries stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get tickets with optional filters
router.get("/", async (req: Request, res: Response) => {
  try {
    const { country, status, airline, limit = 50, offset = 0 } = req.query as any;

    if (country) {
      const tickets = await TicketRepository.findAvailableTicketsByCountry(country);
      return res.json({ success: true, data: { tickets, total: tickets.length } });
    }

    // Fallback: return recent tickets
    const q = `SELECT t.*, tb.* FROM tickets t JOIN ticket_batches tb ON t.batch_id = tb.id ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);

    const tickets = result.rows.map((row: any) => ({
      id: row.id,
      batch_id: row.batch_id,
      status: row.status,
      selling_price: row.selling_price,
      created_at: row.created_at,
      batch: {
        id: row.id,
        country_id: row.country_id,
        airline_id: row.airline_id,
        flight_date: row.flight_date,
        flight_time: row.flight_time,
        buying_price: row.buying_price,
        quantity: row.quantity,
        agent_name: row.agent_name,
        remarks: row.remarks,
        created_at: row.created_at,
      },
    }));

    res.json({ success: true, data: { tickets, total: tickets.length } });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get tickets by country
router.get("/country/:code", async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const tickets = await TicketRepository.findAvailableTicketsByCountry(code);
    res.json({ success: true, data: { tickets, total: tickets.length } });
  } catch (error) {
    console.error("Error fetching tickets by country:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get all tickets (administrative)
router.get("/all", async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query as any;
    const q = `SELECT t.*, tb.* FROM tickets t JOIN ticket_batches tb ON t.batch_id = tb.id ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);
    res.json({ success: true, data: { tickets: result.rows, total: result.rowCount } });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get ticket by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ticket = await TicketRepository.findTicketById(id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });
    res.json({ success: true, data: { ticket } });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update ticket status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    const result = await query("UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Ticket not found" });

    res.json({ success: true, message: "Status updated", data: { ticket: result.rows[0] } });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

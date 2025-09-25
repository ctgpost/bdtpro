import { Router, Request, Response } from "express";
import { BookingRepository } from "../database/models";

const router = Router();

// Get bookings
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query as any;
    // Basic listing
    const result = await (await import("../database/schema")).query(`SELECT b.* FROM bookings b ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`, [Number(limit), Number(offset)]);
    res.json({ success: true, data: { bookings: result.rows, total: result.rowCount } });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create booking
router.post("/", async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    const booking = await BookingRepository.create(bookingData);
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update booking status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });

    const result = await (await import("../database/schema")).query("UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Status updated", data: { booking: result.rows[0] } });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Cancel booking
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await (await import("../database/schema")).query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;

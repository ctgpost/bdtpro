import path from "path";
import * as express from "express";
import express__default, { Router } from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { z } from "zod";
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "bd_ticketpro",
    password: process.env.DB_PASSWORD || "postgres",
    port: parseInt(process.env.DB_PORT || "5432")
  });
}
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("Executed query", { text, duration, rows: res.rowCount });
  return res;
};
async function initializeDatabase() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code CHAR(2) UNIQUE NOT NULL,
        name TEXT NOT NULL,
        flag_emoji TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS airlines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_code CHAR(2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS ticket_batches (
        id SERIAL PRIMARY KEY,
        country_id INTEGER NOT NULL,
        airline_id INTEGER,
        flight_date DATE NOT NULL,
        flight_time TIME,
        buying_price DECIMAL(10, 2) NOT NULL,
        quantity INTEGER NOT NULL,
        agent_name TEXT,
        agent_contact TEXT,
        remarks TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (country_id) REFERENCES countries(id),
        FOREIGN KEY (airline_id) REFERENCES airlines(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        batch_id INTEGER NOT NULL,
        ticket_number TEXT UNIQUE,
        selling_price DECIMAL(10, 2),
        status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'locked', 'sold', 'cancelled')),
        locked_by UUID,
        locked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (batch_id) REFERENCES ticket_batches(id),
        FOREIGN KEY (locked_by) REFERENCES users(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        passport_number TEXT,
        address TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        ticket_id INTEGER,
        booking_date DATE NOT NULL,
        travel_date DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type TEXT NOT NULL DEFAULT 'full' CHECK (payment_type IN ('full', 'partial')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
        comments TEXT,
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS umrah_packages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        departure_date DATE NOT NULL,
        return_date DATE NOT NULL,
        hotel_name TEXT,
        hotel_location TEXT,
        room_type TEXT NOT NULL DEFAULT 'double' CHECK (room_type IN ('single', 'double', 'triple')),
        price_per_person DECIMAL(10, 2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
        created_by UUID NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS umrah_group_tickets (
        id SERIAL PRIMARY KEY,
        package_id INTEGER NOT NULL,
        ticket_count INTEGER NOT NULL,
        available_count INTEGER NOT NULL DEFAULT 0,
        sold_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (package_id) REFERENCES umrah_packages(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id UUID,
        action TEXT NOT NULL,
        description TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_tickets_batch_id ON tickets(batch_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_bookings_ticket_id ON bookings(ticket_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_ticket_batches_country_id ON ticket_batches(country_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_passport ON customers(passport_number)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_umrah_packages_status ON umrah_packages(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at)`);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
async function getSetting(key) {
  const result = await query(
    "SELECT setting_value FROM settings WHERE setting_key = $1",
    [key]
  );
  return result.rows[0]?.setting_value;
}
async function setSetting(key, value) {
  const result = await query(
    `INSERT INTO settings (setting_key, setting_value)
     VALUES ($1, $2)
     ON CONFLICT (setting_key)
     DO UPDATE SET setting_value = $2, updated_at = NOW()
     RETURNING *`,
    [key, value]
  );
  return result.rows[0];
}
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getSetting,
  initializeDatabase,
  query,
  setSetting
}, Symbol.toStringTag, { value: "Module" }));
class UserRepository {
  static async findById(id) {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  }
  static async findByUsername(username) {
    const result = await query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0];
  }
  static async findAll() {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows;
  }
  static async create(userData) {
    const id = v4();
    const password_hash = bcrypt.hashSync(userData.password, 10);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      `INSERT INTO users (id, username, password_hash, name, email, phone, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id,
        userData.username,
        password_hash,
        userData.name,
        userData.email,
        userData.phone,
        userData.role,
        userData.status,
        now,
        now
      ]
    );
    return result.rows[0];
  }
  static async updateLastLogin(userId) {
    await query(
      "UPDATE users SET last_login = $1, updated_at = $1 WHERE id = $2",
      [(/* @__PURE__ */ new Date()).toISOString(), userId]
    );
  }
  static verifyPassword(password, hash) {
    return bcrypt.compareSync(password, hash);
  }
}
class TicketRepository {
  static async createBatch(batchData) {
    const id = v4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      `INSERT INTO ticket_batches (id, country_code, airline, flight_date, flight_time, buying_price, quantity, agent_name, agent_contact, agent_address, remarks, document_url, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        id,
        batchData.country_code,
        batchData.airline,
        batchData.flight_date,
        batchData.flight_time,
        batchData.buying_price,
        batchData.quantity,
        batchData.agent_name,
        batchData.agent_contact,
        batchData.agent_address,
        batchData.remarks,
        batchData.document_url,
        batchData.created_by,
        now
      ]
    );
    const batch = result.rows[0];
    const ticketPromises = [];
    for (let i = 0; i < batch.quantity; i++) {
      ticketPromises.push(this.createTicket({
        batch_id: batch.id,
        selling_price: batch.buying_price * 1.1,
        // Default 10% markup
        status: "available"
      }));
    }
    await Promise.all(ticketPromises);
    return batch;
  }
  static async createTicket(ticketData) {
    const id = v4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      `INSERT INTO tickets (id, batch_id, status, selling_price, passenger_info, sold_by, sold_at, locked_until, booking_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id,
        ticketData.batch_id,
        ticketData.status,
        ticketData.selling_price,
        ticketData.passenger_info,
        ticketData.sold_by,
        ticketData.sold_at,
        ticketData.locked_until,
        ticketData.booking_id,
        now
      ]
    );
    return result.rows[0];
  }
  static async findBatchById(id) {
    const result = await query("SELECT * FROM ticket_batches WHERE id = $1", [id]);
    return result.rows[0];
  }
  static async findTicketById(id) {
    const result = await query("SELECT * FROM tickets WHERE id = $1", [id]);
    return result.rows[0];
  }
  static async findTicketsByBatchId(batchId) {
    const result = await query("SELECT * FROM tickets WHERE batch_id = $1 ORDER BY created_at", [batchId]);
    return result.rows;
  }
  static async findAvailableTicketsByCountry(countryCode) {
    const result = await query(
      `SELECT t.*, tb.* FROM tickets t
       JOIN ticket_batches tb ON t.batch_id = tb.id
       WHERE tb.country_code = $1 AND t.status = 'available'
       ORDER BY tb.flight_date, t.created_at`,
      [countryCode]
    );
    return result.rows.map((row) => ({
      id: row.id,
      batch_id: row.batch_id,
      status: row.status,
      selling_price: row.selling_price,
      passenger_info: row.passenger_info,
      sold_by: row.sold_by,
      sold_at: row.sold_at,
      locked_until: row.locked_until,
      booking_id: row.booking_id,
      created_at: row.created_at,
      batch: {
        id: row.id,
        country_code: row.country_code,
        airline: row.airline,
        flight_date: row.flight_date,
        flight_time: row.flight_time,
        buying_price: row.buying_price,
        quantity: row.quantity,
        agent_name: row.agent_name,
        agent_contact: row.agent_contact,
        agent_address: row.agent_address,
        remarks: row.remarks,
        document_url: row.document_url,
        created_by: row.created_by,
        created_at: row.created_at
      }
    }));
  }
  static async lockTicket(ticketId, userId, minutes) {
    const lockUntil = new Date(Date.now() + minutes * 6e4).toISOString();
    const result = await query(
      "UPDATE tickets SET status = 'locked', locked_until = $1, sold_by = $2 WHERE id = $3 RETURNING *",
      [lockUntil, userId, ticketId]
    );
    return result.rows[0];
  }
  static async unlockExpiredTickets() {
    await query(
      "UPDATE tickets SET status = 'available', locked_until = NULL, sold_by = NULL WHERE status = 'locked' AND locked_until < NOW()"
    );
  }
}
class BookingRepository {
  static async create(bookingData) {
    const id = v4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      `INSERT INTO bookings (id, ticket_id, agent_info, passenger_info, selling_price, payment_type, comments, created_by, created_at, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        id,
        bookingData.ticket_id,
        bookingData.agent_info,
        bookingData.passenger_info,
        bookingData.selling_price,
        bookingData.payment_type,
        bookingData.comments,
        bookingData.created_by,
        now,
        bookingData.expires_at
      ]
    );
    return result.rows[0];
  }
  static async findById(id) {
    const result = await query("SELECT * FROM bookings WHERE id = $1", [id]);
    return result.rows[0];
  }
  static async findByTicketId(ticketId) {
    const result = await query("SELECT * FROM bookings WHERE ticket_id = $1", [ticketId]);
    return result.rows[0];
  }
  static async confirm(bookingId, userId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      "UPDATE bookings SET confirmed_at = $1 WHERE id = $2 RETURNING *",
      [now, bookingId]
    );
    return result.rows[0];
  }
}
class ActivityLogRepository {
  static async create(logData) {
    const id = v4();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const result = await query(
      `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        id,
        logData.user_id,
        logData.action,
        logData.entity_type,
        logData.entity_id,
        logData.details,
        logData.ip_address,
        logData.user_agent,
        now
      ]
    );
    return result.rows[0];
  }
}
const JWT_SECRET = process.env.JWT_SECRET || "bd_ticket_pro_secret";
const TOKEN_EXPIRY = "7d";
function generateToken(user) {
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization") || req.get("authorization");
    if (!authHeader) return res.status(401).json({ success: false, message: "Authorization header missing" });
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ success: false, message: "Invalid authorization header" });
    const token = parts[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
    if (!decoded || !decoded.id) return res.status(401).json({ success: false, message: "Invalid token payload" });
    const user = await UserRepository.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const router$6 = Router();
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
router$6.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await UserRepository.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
    if (user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is inactive"
      });
    }
    if (!UserRepository.verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }
    await UserRepository.updateLastLogin(user.id);
    await ActivityLogRepository.create({
      user_id: user.id,
      action: "login",
      entity_type: "auth",
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent")
    });
    const token = generateToken(user);
    delete user.password_hash;
    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
router$6.get("/me", authenticate, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      message: "User profile retrieved",
      data: user
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
const router$5 = Router();
router$5.get("/dashboard/stats", async (_req, res) => {
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
      lockedTickets: Number(row.locked_tickets || 0)
    } });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$5.get("/countries/stats", async (_req, res) => {
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
router$5.get("/", async (req, res) => {
  try {
    const { country, status, airline, limit = 50, offset = 0 } = req.query;
    if (country) {
      const tickets2 = await TicketRepository.findAvailableTicketsByCountry(country);
      return res.json({ success: true, data: { tickets: tickets2, total: tickets2.length } });
    }
    const q = `SELECT t.*, tb.* FROM tickets t JOIN ticket_batches tb ON t.batch_id = tb.id ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);
    const tickets = result.rows.map((row) => ({
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
        created_at: row.created_at
      }
    }));
    res.json({ success: true, data: { tickets, total: tickets.length } });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$5.get("/country/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const tickets = await TicketRepository.findAvailableTicketsByCountry(code);
    res.json({ success: true, data: { tickets, total: tickets.length } });
  } catch (error) {
    console.error("Error fetching tickets by country:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$5.get("/all", async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const q = `SELECT t.*, tb.* FROM tickets t JOIN ticket_batches tb ON t.batch_id = tb.id ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);
    res.json({ success: true, data: { tickets: result.rows, total: result.rowCount } });
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$5.get("/:id", async (req, res) => {
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
router$5.patch("/:id/status", async (req, res) => {
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
const router$4 = Router();
router$4.get("/", async (req, res) => {
  try {
    const { country, airline, dateFrom, dateTo, limit = 50, offset = 0 } = req.query;
    const q = `SELECT tb.* FROM ticket_batches tb WHERE 1=1
      ${country ? "AND tb.country_id = (SELECT id FROM countries WHERE code = $3)" : ""}
      ORDER BY tb.created_at DESC LIMIT $1 OFFSET $2`;
    if (country) {
      const result2 = await (await Promise.resolve().then(() => schema)).query(`SELECT tb.* FROM ticket_batches tb JOIN countries c ON tb.country_id = c.id WHERE c.code = $1 ORDER BY tb.created_at DESC LIMIT $2 OFFSET $3`, [country, Number(limit), Number(offset)]);
      return res.json({ success: true, data: result2.rows });
    }
    const result = await (await Promise.resolve().then(() => schema)).query(`SELECT tb.* FROM ticket_batches tb ORDER BY tb.created_at DESC LIMIT $1 OFFSET $2`, [Number(limit), Number(offset)]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching ticket batches:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$4.post("/", async (req, res) => {
  try {
    const batchData = req.body;
    const batch = await TicketRepository.createBatch(batchData);
    res.json({ success: true, data: batch });
  } catch (error) {
    console.error("Error creating ticket batch:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
const router$3 = Router();
router$3.get("/", async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const result = await (await Promise.resolve().then(() => schema)).query(`SELECT b.* FROM bookings b ORDER BY b.created_at DESC LIMIT $1 OFFSET $2`, [Number(limit), Number(offset)]);
    res.json({ success: true, data: { bookings: result.rows, total: result.rowCount } });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$3.post("/", async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await BookingRepository.create(bookingData);
    res.json({ success: true, data: booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$3.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: "Status is required" });
    const result = await (await Promise.resolve().then(() => schema)).query("UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *", [status, id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Status updated", data: { booking: result.rows[0] } });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$3.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await (await Promise.resolve().then(() => schema)).query("DELETE FROM bookings WHERE id = $1 RETURNING *", [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, message: "Booking not found" });
    res.json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
const router$2 = Router();
router$2.get("/", async (_req, res) => {
  try {
    const users = await UserRepository.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$2.post("/", async (req, res) => {
  try {
    const { username, password, name, email, phone, role = "staff", status = "active" } = req.body;
    const user = await UserRepository.create({ username, password, name, email, phone, role, status });
    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
const router$1 = Router();
router$1.get("/", async (req, res) => {
  try {
    const { key } = req.query;
    if (key) {
      const value = await getSetting(key);
      return res.json({ success: true, data: { [key]: value } });
    }
    const result = await (await Promise.resolve().then(() => schema)).query("SELECT setting_key, setting_value FROM settings ORDER BY setting_key");
    const data = result.rows.reduce((acc, row) => (acc[row.setting_key] = row.setting_value, acc), {});
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router$1.post("/", async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ success: false, message: "Key is required" });
    const setting = await setSetting(key, String(value));
    res.json({ success: true, data: setting });
  } catch (error) {
    console.error("Error setting setting:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
const router = Router();
router.get("/group-tickets", async (req, res) => {
  try {
    const { packageType, limit = 50, offset = 0 } = req.query;
    const q = `SELECT g.*, p.name as package_name FROM umrah_group_tickets g JOIN umrah_packages p ON g.package_id = p.id ORDER BY g.created_at DESC LIMIT $1 OFFSET $2`;
    const result = await query(q, [Number(limit), Number(offset)]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching umrah group tickets:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
router.post("/group-tickets", async (req, res) => {
  try {
    const { package_id, ticket_count } = req.body;
    const result = await query(`INSERT INTO umrah_group_tickets (package_id, ticket_count, available_count, sold_count) VALUES ($1, $2, $2, 0) RETURNING *`, [package_id, ticket_count]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error creating umrah group ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});
async function createServer() {
  const app = express__default();
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
  app.use(
    cors({
      origin: [process.env.FRONTEND_URL || ""],
      credentials: true
    })
  );
  app.use(express__default.json({ limit: "10mb" }));
  app.use(express__default.urlencoded({ extended: true, limit: "10mb" }));
  app.use((req, res, next) => {
    console.log(`${(/* @__PURE__ */ new Date()).toISOString()} - ${req.method} ${req.path}`);
    next();
  });
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "BD TicketPro API Server",
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use("/api/auth", router$6);
  app.use("/api/tickets", router$5);
  app.use("/api/batches", router$4);
  app.use("/api/bookings", router$3);
  app.use("/api/users", router$2);
  app.use("/api/settings", router$1);
  app.use("/api/umrah", router);
  {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendPath = path.join(__dirname, "..", "dist", "spa");
    app.use(express__default.static(frontendPath));
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found"
    });
  });
  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  });
  return app;
}
async function startServer() {
  const app = await createServer();
  const port = process.env.PORT || 3e3;
  const __dirname = import.meta.dirname;
  const distPath = path.join(__dirname, "../spa");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(port, () => {
    console.log(`🚀 BD TicketPro server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
  });
  process.on("SIGTERM", () => {
    console.log("🛑 Received SIGTERM, shutting down gracefully");
    process.exit(0);
  });
  process.on("SIGINT", () => {
    console.log("🛑 Received SIGINT, shutting down gracefully");
    process.exit(0);
  });
}
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
//# sourceMappingURL=node-build.mjs.map

import { query } from "./schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// User model
export interface User {
  id: string;
  username: string;
  password_hash?: string;
  name: string;
  email?: string;
  phone?: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  static async findById(id: string): Promise<User | undefined> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] as User;
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const result = await query("SELECT * FROM users WHERE username = $1", [username]);
    return result.rows[0] as User;
  }

  static async findAll(): Promise<User[]> {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows as User[];
  }

  static async create(
    userData: Omit<User, "id" | "created_at" | "updated_at"> & {
      password: string;
    }
  ): Promise<User> {
    const id = uuidv4();
    const password_hash = bcrypt.hashSync(userData.password, 10);
    const now = new Date().toISOString();

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
        now,
      ]
    );

    return result.rows[0] as User;
  }

  static async updateLastLogin(userId: string): Promise<void> {
    await query(
      "UPDATE users SET last_login = $1, updated_at = $1 WHERE id = $2",
      [new Date().toISOString(), userId]
    );
  }

  static verifyPassword(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}

// Country model
export interface Country {
  code: string;
  name: string;
  flag: string;
  created_at: string;
}

export class CountryRepository {
  static async findAll(): Promise<Country[]> {
    const result = await query("SELECT * FROM countries ORDER BY name");
    return result.rows as Country[];
  }

  static async findByCode(code: string): Promise<Country | undefined> {
    const result = await query("SELECT * FROM countries WHERE code = $1", [code]);
    return result.rows[0] as Country;
  }
}

// Ticket models
export interface TicketBatch {
  id: string;
  country_code: string;
  airline: string;
  flight_date: string;
  flight_time: string;
  buying_price: number;
  quantity: number;
  agent_name: string;
  agent_contact?: string;
  agent_address?: string;
  remarks?: string;
  document_url?: string;
  created_by: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  batch_id: string;
  status: "available" | "booked" | "locked" | "sold";
  selling_price: number;
  passenger_info?: any;
  sold_by?: string;
  sold_at?: string;
  locked_until?: string;
  booking_id?: string;
  created_at: string;
}

export class TicketRepository {
  static async createBatch(batchData: Omit<TicketBatch, "id" | "created_at">): Promise<TicketBatch> {
    const id = uuidv4();
    const now = new Date().toISOString();

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
        now,
      ]
    );

    // Create individual tickets for this batch
    const batch = result.rows[0] as TicketBatch;
    const ticketPromises = [];
    for (let i = 0; i < batch.quantity; i++) {
      ticketPromises.push(this.createTicket({
        batch_id: batch.id,
        selling_price: batch.buying_price * 1.1, // Default 10% markup
        status: "available",
      }));
    }
    await Promise.all(ticketPromises);

    return batch;
  }

  static async createTicket(ticketData: Omit<Ticket, "id" | "created_at">): Promise<Ticket> {
    const id = uuidv4();
    const now = new Date().toISOString();

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
        now,
      ]
    );

    return result.rows[0] as Ticket;
  }

  static async findBatchById(id: string): Promise<TicketBatch | undefined> {
    const result = await query("SELECT * FROM ticket_batches WHERE id = $1", [id]);
    return result.rows[0] as TicketBatch;
  }

  static async findTicketById(id: string): Promise<Ticket | undefined> {
    const result = await query("SELECT * FROM tickets WHERE id = $1", [id]);
    return result.rows[0] as Ticket;
  }

  static async findTicketsByBatchId(batchId: string): Promise<Ticket[]> {
    const result = await query("SELECT * FROM tickets WHERE batch_id = $1 ORDER BY created_at", [batchId]);
    return result.rows as Ticket[];
  }

  static async findAvailableTicketsByCountry(countryCode: string): Promise<(Ticket & { batch: TicketBatch })[]> {
    const result = await query(
      `SELECT t.*, tb.* FROM tickets t
       JOIN ticket_batches tb ON t.batch_id = tb.id
       WHERE tb.country_code = $1 AND t.status = 'available'
       ORDER BY tb.flight_date, t.created_at`,
      [countryCode]
    );
    
    return result.rows.map(row => ({
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
        created_at: row.created_at,
      }
    })) as (Ticket & { batch: TicketBatch })[];
  }

  static async lockTicket(ticketId: string, userId: string, minutes: number): Promise<Ticket> {
    const lockUntil = new Date(Date.now() + minutes * 60000).toISOString();
    
    const result = await query(
      "UPDATE tickets SET status = 'locked', locked_until = $1, sold_by = $2 WHERE id = $3 RETURNING *",
      [lockUntil, userId, ticketId]
    );
    
    return result.rows[0] as Ticket;
  }

  static async unlockExpiredTickets(): Promise<void> {
    await query(
      "UPDATE tickets SET status = 'available', locked_until = NULL, sold_by = NULL WHERE status = 'locked' AND locked_until < NOW()"
    );
  }
}

// Booking model
export interface Booking {
  id: string;
  ticket_id: string;
  agent_info: any;
  passenger_info: any;
  selling_price: number;
  payment_type: "full" | "partial";
  comments?: string;
  created_by: string;
  created_at: string;
  confirmed_at?: string;
  expires_at: string;
}

export class BookingRepository {
  static async create(bookingData: Omit<Booking, "id" | "created_at">): Promise<Booking> {
    const id = uuidv4();
    const now = new Date().toISOString();

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
        bookingData.expires_at,
      ]
    );

    return result.rows[0] as Booking;
  }

  static async findById(id: string): Promise<Booking | undefined> {
    const result = await query("SELECT * FROM bookings WHERE id = $1", [id]);
    return result.rows[0] as Booking;
  }

  static async findByTicketId(ticketId: string): Promise<Booking | undefined> {
    const result = await query("SELECT * FROM bookings WHERE ticket_id = $1", [ticketId]);
    return result.rows[0] as Booking;
  }

  static async confirm(bookingId: string, userId: string): Promise<Booking> {
    const now = new Date().toISOString();
    
    const result = await query(
      "UPDATE bookings SET confirmed_at = $1 WHERE id = $2 RETURNING *",
      [now, bookingId]
    );
    
    return result.rows[0] as Booking;
  }
}

// Activity log model
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export class ActivityLogRepository {
  static async create(logData: Omit<ActivityLog, "id" | "created_at">): Promise<ActivityLog> {
    const id = uuidv4();
    const now = new Date().toISOString();

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
        now,
      ]
    );

    return result.rows[0] as ActivityLog;
  }
}
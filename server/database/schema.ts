import { Pool, QueryResult } from 'pg';
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// PostgreSQL connection pool
let pool: Pool;

// Check if we have a DATABASE_URL (for platforms like Heroku, Render)
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  // Use individual connection parameters
  pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bd_ticketpro',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
  });
}

// Function to execute queries
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

// Initialize database with tables
export async function initializeDatabase() {
  try {
    // Create users table
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

    // Create countries table
    await query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code CHAR(2) UNIQUE NOT NULL,
        name TEXT NOT NULL,
        flag_emoji TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create airlines table
    await query(`
      CREATE TABLE IF NOT EXISTS airlines (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        country_code CHAR(2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create ticket_batches table (admin buying)
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

    // Create tickets table
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

    // Create customers table
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

    // Create bookings table
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

    // Create umrah_packages table
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

    // Create umrah_group_tickets table
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

    // Create activity_logs table
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

    // Create settings table
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

    // Create sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id UUID NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create indexes for better performance
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

    // Create default users if they don't exist
    await createDefaultUsers();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Create default users if they don't exist
async function createDefaultUsers() {
  try {
    // Check if admin user exists
    const adminUser = await query(
      "SELECT * FROM users WHERE username = $1",
      ["admin"]
    );
    
    if (adminUser.rows.length === 0) {
      // Create default admin user
      const adminId = uuidv4();
      const adminPasswordHash = await bcrypt.hash("admin123", 10);
      
      await query(
        `INSERT INTO users (id, username, password_hash, name, email, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          adminId,
          "admin",
          adminPasswordHash,
          "Admin User",
          "admin@example.com",
          "+1234567890",
          "admin",
          "active"
        ]
      );
      
      console.log("Default admin user created (username: admin, password: admin123)");
    }

    // Check if manager user exists
    const managerUser = await query(
      "SELECT * FROM users WHERE username = $1",
      ["manager"]
    );
    
    if (managerUser.rows.length === 0) {
      // Create default manager user
      const managerId = uuidv4();
      const managerPasswordHash = await bcrypt.hash("manager123", 10);
      
      await query(
        `INSERT INTO users (id, username, password_hash, name, email, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          managerId,
          "manager",
          managerPasswordHash,
          "Manager User",
          "manager@example.com",
          "+1234567891",
          "manager",
          "active"
        ]
      );
      
      console.log("Default manager user created (username: manager, password: manager123)");
    }

    // Check if staff user exists
    const staffUser = await query(
      "SELECT * FROM users WHERE username = $1",
      ["staff"]
    );
    
    if (staffUser.rows.length === 0) {
      // Create default staff user
      const staffId = uuidv4();
      const staffPasswordHash = await bcrypt.hash("staff123", 10);
      
      await query(
        `INSERT INTO users (id, username, password_hash, name, email, phone, role, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          staffId,
          "staff",
          staffPasswordHash,
          "Staff User",
          "staff@example.com",
          "+1234567892",
          "staff",
          "active"
        ]
      );
      
      console.log("Default staff user created (username: staff, password: staff123)");
    }
  } catch (error) {
    console.error("Error creating default users:", error);
  }
}

// User functions
export async function createUser(userData: any) {
  const id = uuidv4();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const result = await query(
    `INSERT INTO users (id, username, password_hash, name, email, phone, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, username, name, email, phone, role, status, created_at, updated_at`,
    [
      id,
      userData.username,
      hashedPassword,
      userData.name,
      userData.email,
      userData.phone,
      userData.role
    ]
  );
  
  return result.rows[0];
}

export async function findUserByUsername(username: string) {
  const result = await query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  );
  
  return result.rows[0];
}

export async function findUserById(id: string) {
  const result = await query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  
  return result.rows[0];
}

// Country functions
export async function createCountry(countryData: any) {
  const result = await query(
    `INSERT INTO countries (code, name, flag_emoji)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [countryData.code, countryData.name, countryData.flag_emoji]
  );
  
  return result.rows[0];
}

export async function getAllCountries() {
  const result = await query('SELECT * FROM countries ORDER BY name');
  return result.rows;
}

// Settings functions
export async function getSetting(key: string) {
  const result = await query(
    'SELECT setting_value FROM settings WHERE setting_key = $1',
    [key]
  );
  
  return result.rows[0]?.setting_value;
}

export async function setSetting(key: string, value: string) {
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
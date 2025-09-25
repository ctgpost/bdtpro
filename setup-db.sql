-- BD TicketPro PostgreSQL Database Setup Script

-- Create the database (run this as a superuser)
CREATE DATABASE bd_ticketpro;

-- Connect to the database
\c bd_ticketpro;

-- Create a dedicated user for the application (optional but recommended)
CREATE USER bd_ticketpro_user WITH PASSWORD 'bd_ticketpro_password';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE bd_ticketpro TO bd_ticketpro_user;

-- If using the public schema, grant usage
GRANT USAGE ON SCHEMA public TO bd_ticketpro_user;
GRANT CREATE ON SCHEMA public TO bd_ticketpro_user;

-- Note: The application will create all tables automatically on first run
-- through the initializeDatabase() function in server/database/schema.ts
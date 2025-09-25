# BD TicketPro - PostgreSQL Version

A comprehensive travel agency management system for Bangladeshi travel agencies, now using PostgreSQL as the database backend.

## Features

- **Dashboard**: Real-time business metrics and analytics
- **Country Management**: View all destination countries with flag icons
- **Ticket Management**: Comprehensive ticket inventory system
- **Booking System**: Create and manage customer bookings
- **Admin Buying Interface**: Manage ticket batches and inventory
- **Umrah Management**: Specialized management for Umrah packages
- **Reporting**: Sales reports and analytics
- **User Management**: Role-based access control (admin, manager, staff)

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and production builds
- Tailwind CSS with custom luxury theme
- shadcn/ui components with Radix UI primitives
- React Query for server state management
- React Router for client-side navigation
- Framer Motion for animations

### Backend
- Node.js with Express.js
- PostgreSQL database with node-postgres (pg) driver
- JWT-based authentication system
- Zod for request validation

## Prerequisites

- Node.js 20.x
- PostgreSQL 13+
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BD-TicketPro-PostgreSQL
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   # Option 1: Using DATABASE_URL (for platforms like Render, Heroku)
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_jwt_secret_key
   
   # Option 2: Using individual database variables
   DB_USER=your_postgres_username
   DB_HOST=localhost
   DB_NAME=bd_ticketpro
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```

4. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE bd_ticketpro;
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at: `http://localhost:8080`

## Demo Credentials

- **Admin**: username: `admin`, password: `admin123`
- **Manager**: username: `manager`, password: `manager123`
- **Staff**: username: `staff`, password: `staff123`

## Build for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Key Differences from SQLite Version

1. **Database**: Uses PostgreSQL instead of SQLite for better scalability
2. **Connection**: Uses connection pooling for better performance
3. **Data Types**: Uses PostgreSQL-specific data types (UUID, JSONB, TIMESTAMPTZ)
4. **Indexing**: Added database indexes for better query performance
5. **Async Operations**: All database operations are now properly asynchronous

## Database Schema

The application uses the following tables:
- `users`: User accounts and roles
- `countries`: Destination countries
- `airlines`: Airline information
- `ticket_batches`: Groups of tickets from the same supplier
- `tickets`: Individual tickets
- `bookings`: Customer bookings
- `umrah_groups`: Umrah package groups
- `umrah_group_tickets`: Individual tickets within Umrah packages
- `activity_logs`: User activity tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is proprietary software for BD TicketPro.
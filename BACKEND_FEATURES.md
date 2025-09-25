# BD TicketPro - Backend Features and Functions

This document provides a comprehensive overview of all backend features and functions that support the BD TicketPro application's pages and features.

## 1. Authentication System

### Backend Components:
- **Authentication Routes** (`server/routes/auth.ts`)
- **Authentication Middleware** (`server/middleware/auth.ts`)
- **User Repository** (`server/database/models.ts`)

### Key Functions:
1. **User Login**
   - Validates username and password
   - Generates JWT token for authenticated sessions
   - Logs user login activity
   - Updates last login timestamp

2. **Token Management**
   - Generates and verifies JWT tokens
   - Handles token expiration and validation
   - Role-based access control

3. **User Management**
   - Retrieves user profile information
   - Manages user roles (admin, manager, staff)
   - Handles user status (active/inactive)

## 2. Dashboard with Business Metrics

### Backend Components:
- **Financial Calculator** (`server/lib/financial-calculator.ts`)
- **Ticket Repository** (`server/database/models.ts`)
- **Booking Repository** (`server/database/models.ts`)

### Key Functions:
1. **Dashboard Statistics**
   - Calculates today's sales metrics
   - Retrieves low stock countries
   - Identifies top performing countries
   - Computes financial summaries

2. **Data Aggregation**
   - Combines ticket and booking data
   - Calculates profit margins
   - Generates performance reports

## 3. Countries Management

### Backend Components:
- **Country Repository** (`server/database/models.ts`)
- **Ticket Batch Repository** (`server/database/models.ts`)

### Key Functions:
1. **Country Data Management**
   - CRUD operations for countries
   - Flag and metadata management
   - Country code validation

2. **Country Statistics**
   - Calculates ticket availability by country
   - Tracks ticket batch quantities
   - Monitors country performance metrics

## 4. Tickets Inventory and Pricing Management

### Backend Components:
- **Ticket Repository** (`server/database/models.ts`)
- **Ticket Batch Repository** (`server/database/models.ts`)
- **Ticket Routes** (`server/routes/tickets.ts`)
- **Ticket Batch Routes** (`server/routes/ticket-batches.ts`)

### Key Functions:
1. **Ticket Management**
   - Create, read, update, and delete individual tickets
   - Manage ticket status (available, booked, locked, sold)
   - Handle ticket pricing and flight information

2. **Batch Processing**
   - Create ticket batches by country
   - Manage batch quantities and agent information
   - Track batch-level buying prices

3. **Ticket Search and Filtering**
   - Filter by country, status, airline
   - Sort by various criteria
   - Pagination support

4. **Ticket Status Updates**
   - Lock tickets for 24 hours
   - Mark tickets as sold
   - Release locked tickets

## 5. Admin Ticket Purchasing

### Backend Components:
- **Ticket Batch Routes** (`server/routes/ticket-batches.ts`)
- **Ticket Batch Repository** (`server/database/models.ts`)

### Key Functions:
1. **Batch Creation**
   - Create new ticket batches with country, airline, and flight information
   - Set buying prices and quantities
   - Associate with agents

2. **Batch Management**
   - View existing batches
   - Update batch information
   - Delete batches when needed

## 6. Customer Booking Management

### Backend Components:
- **Booking Routes** (`server/routes/bookings.ts`)
- **Booking Repository** (`server/database/models.ts`)
- **Ticket Repository** (`server/database/models.ts`)

### Key Functions:
1. **Booking Creation**
   - Create new bookings for tickets
   - Validate booking information
   - Calculate selling prices

2. **Booking Management**
   - View all bookings or user-specific bookings
   - Update booking status (pending, confirmed, cancelled, expired)
   - Cancel bookings when needed

3. **Payment Handling**
   - Support for full or partial payments
   - Track payment methods and details
   - Manage payment status

## 7. Umrah Packages and Group Tickets

### Backend Components:
- **Umrah Routes** (`server/routes/umrah.ts`)
- **Umrah Repositories** (`server/database/models.ts`)

### Key Functions:
1. **Umrah With Transport Management**
   - Manage packages with flight transportation
   - Track passenger information, PNR, and flight details
   - Handle approvals and references

2. **Umrah Without Transport Management**
   - Manage packages without flight transportation
   - Track payment progress
   - Monitor remaining amounts

3. **Umrah Group Tickets**
   - Create group tickets for Umrah packages
   - Manage departure and return dates
   - Track ticket counts and costs

4. **Group Booking Assignment**
   - Assign passengers to group tickets
   - Manage passenger allocations
   - Track remaining ticket availability

## 8. Business Analytics and Reporting

### Backend Components:
- **Financial Calculator** (`server/lib/financial-calculator.ts`)
- **Various Repositories** (`server/database/models.ts`)

### Key Functions:
1. **Sales Analytics**
   - Calculate daily, weekly, monthly sales
   - Track profit margins
   - Monitor booking trends

2. **Performance Metrics**
   - Country performance analysis
   - Agent performance tracking
   - Revenue forecasting

3. **Financial Reports**
   - Generate financial summaries
   - Calculate potential profits
   - Track payment statuses

## 9. System Settings and User Management

### Backend Components:
- **Settings Routes** (`server/routes/settings.ts`)
- **User Routes** (`server/routes/users.ts`)
- **User Repository** (`server/database/models.ts`)
- **Activity Log Repository** (`server/database/models.ts`)

### Key Functions:
1. **User Management**
   - Create, update, and delete users
   - Manage user roles and permissions
   - Handle user status changes

2. **System Configuration**
   - Manage application settings
   - Configure business parameters
   - Handle system preferences

3. **Activity Logging**
   - Track user activities
   - Log system events
   - Audit trail management

## 10. Database Schema and Models

### Backend Components:
- **Database Schema** (`server/database/schema.ts`)
- **Models** (`server/database/models.ts`)

### Key Entities:
1. **Users** - Authentication and authorization
2. **Countries** - Destination country information
3. **Ticket Batches** - Groups of tickets by flight
4. **Tickets** - Individual ticket records
5. **Bookings** - Customer booking information
6. **Umrah Packages** - With and without transport packages
7. **Umrah Group Tickets** - Group ticket allocations
8. **Activity Logs** - System activity tracking

## API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Tickets
- `GET /api/tickets` - Get all tickets
- `GET /api/tickets/:id` - Get specific ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id/status` - Update ticket status
- `PUT /api/tickets/:id` - Update ticket information
- `DELETE /api/tickets/:id` - Delete ticket

### Ticket Batches
- `GET /api/ticket-batches` - Get all ticket batches
- `GET /api/ticket-batches/:id` - Get specific batch
- `POST /api/ticket-batches` - Create new batch
- `PUT /api/ticket-batches/:id` - Update batch
- `DELETE /api/ticket-batches/:id` - Delete batch

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get specific booking
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Umrah Packages
- `GET /api/umrah/with-transport` - Get Umrah packages with transport
- `GET /api/umrah/without-transport` - Get Umrah packages without transport
- `POST /api/umrah/with-transport` - Create package with transport
- `POST /api/umrah/without-transport` - Create package without transport
- `PUT /api/umrah/with-transport/:id` - Update package with transport
- `PUT /api/umrah/without-transport/:id` - Update package without transport

### Umrah Group Tickets
- `GET /api/umrah/group-tickets` - Get all group tickets
- `POST /api/umrah/group-tickets` - Create new group ticket
- `PUT /api/umrah/group-tickets/:id` - Update group ticket
- `DELETE /api/umrah/group-tickets/:id` - Delete group ticket

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings/:key` - Update specific setting

This comprehensive backend system supports all frontend pages and features of the BD TicketPro application, providing a complete travel agency management solution for Bangladeshi agencies.
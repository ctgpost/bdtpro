# BDTPro - Bangladesh Travel Agency Management System

BDTPro is a comprehensive travel agency management system built with modern web technologies. It allows travel agencies to manage their operations including ticket bookings, customer management, and travel packages.

## Features

- User authentication and authorization
- Ticket booking management
- Customer information management
- Travel package listings
- Admin dashboard
- Responsive design for all devices

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Deployment**: Vercel
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file based on `.env.example`:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8080

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production-please
   JWT_EXPIRES_IN=7d

   # Database Configuration
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=bd_ticketpro
   DB_PASSWORD=your_postgres_password_here
   DB_PORT=5432

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:8080
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

This project is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel for automatic deployments.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
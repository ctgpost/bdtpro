# Netlify Deployment Guide for BD TicketPro

## Application Overview

BD TicketPro is a comprehensive travel agency management system designed for Bangladeshi agencies that handles international flight ticket management and Umrah package administration.

### Pages (13 Total)
1. Admin Buying - Interface for administrators to purchase tickets
2. Bookings - Manage customer bookings
3. Countries - Manage destination countries
4. Country Tickets - Manage tickets for specific countries
5. Dashboard - Business metrics and statistics overview
6. Index - Main landing page
7. Login - User authentication page
8. NotFound - 404 error page
9. Reports - Business analytics and reports
10. Settings - System configuration and user management
11. Tickets - International flight ticket inventory and pricing management
12. Umrah Group Tickets - Manage Umrah group tickets
13. Umrah Management - Umrah package management

### Main Features
- Dashboard with business metrics
- Countries management
- Tickets inventory and pricing
- Admin ticket purchasing
- Customer booking management
- Umrah packages and group tickets
- Business analytics and reporting
- System settings and user management
- JWT-based authentication

## Netlify Deployment Structure

To deploy this application to Netlify, you need to prepare the following files and structure:

```
netlify-deployment/
├── dist/                  # Built application files (generated with npm run build:client)
├── api/                   # API endpoints (if using Netlify Functions)
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies and scripts
```

## Deployment Steps

1. **Build the client application**:
   ```bash
   npm run build:client
   ```

2. **Create Netlify configuration**:
   Create a `netlify.toml` file with appropriate redirects for SPA routing:
   ```toml
   [build]
     command = "npm run build:client"
     publish = "dist/spa"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Configure environment variables**:
   In Netlify dashboard, set the following environment variables:
   - `NODE_ENV = production`
   - `JWT_SECRET = your-secret-key`

## Important Considerations

Since Netlify is a static hosting platform:
1. The SQLite database functionality will not work as-is
2. Server-side API endpoints need to be migrated to Netlify Functions or an external API service
3. Authentication will work but user data cannot be persisted in the SQLite database on Netlify

For a complete solution, consider:
1. Migrating to a serverless database like Fauna or Supabase
2. Converting API endpoints to Netlify Functions
3. Using Netlify Identity for authentication
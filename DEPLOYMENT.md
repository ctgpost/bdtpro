# BD TicketPro Deployment Guide

This guide explains how to deploy the BD TicketPro application online.

## Deployment OptionsBig Chakravarthy about. Directory directory. Add soy desh. Hey, Cortana. Markets are licensed in Capex website. I. Hey, Cortana. Plz. All access of Bishop Maritime. Axis update. Buy data. I. Hey, Cortana. Hey, Cortana. GTA. Muhammad, my love. Show me how to fix up. A union. Shut back up. PDC Offers Akshardham. Tejashwi. At. Paramilitary Sanjay Sanjay Dutt. OK. Hey, Cortana. Youtube. Search. Start Kiriya Nikki movie trailer. My phone. Is.

You can deploy this application in several ways:

1. **Single Platform Deployment** (Recommended for simplicity)
   - Deploy the entire application (frontend + backend) as one service
   - Platforms: Render, Railway, Heroku, etc.

2. **Separate Deployment**
   - Deploy frontend and backend separately
   - Frontend: Vercel, Netlify
   - Backend: Render, Railway, Heroku

## Single Platform Deployment (Recommended)

### Using Render

1. **Create an account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Click "New" → "Web Service"
   - Connect your Git repository or upload your code
   - Set the following configuration:
     - Name: `bd-ticketpro`
     - Runtime: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run start`
     - Plan: Free or Standard

3. **Add PostgreSQL Database**:
   - Click "New" → "PostgreSQL"
   - Configure with a name like `bd-ticketpro-db`
   - Choose your preferred plan

4. **Set Environment Variables**:
   In your Web Service settings, add these environment variables:
   ```
   DATABASE_URL=your_render_database_url
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   NODE_ENV=production
   ```

5. **Update Database Configuration**:
   Modify `server/database/schema.ts` to use DATABASE_URL:
   ```typescript
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: {
       rejectUnauthorized: false
     }
   });
   ```

### Using Railway

1. **Create an account** at [railway.app](https://railway.app)

2. **Create a new project**:
   - Click "New Project"
   - Choose "Deploy from GitHub" or "Deploy from CLI"

3. **Provision PostgreSQL**:
   - In your project, click "New" → "Database"
   - Select PostgreSQL

4. **Deploy the application**:
   - Add your Git repository
   - Set environment variables:
     ```
     DATABASE_URL=your_railway_database_url
     JWT_SECRET=your_very_secure_jwt_secret_key_here
     NODE_ENV=production
     ```

## Separate Deployment

### Frontend Deployment (Vercel)

1. **Prepare for deployment**:
   - Create a `vercel.json` file in your project root:
     ```json
     {
       "rewrites": [
         { "source": "/api/(.*)", "destination": "your_backend_url/api/$1" }
       ]
     }
     ```

2. **Deploy to Vercel**:
   - Install Vercel CLI: `npm install -g vercel`
   - Run: `vercel --prod`
   - Follow the prompts to deploy

### Backend Deployment

Use the same instructions as Single Platform Deployment, but without serving static files.

## Environment Variables

Required environment variables:
```
# Database connection
DATABASE_URL=your_database_connection_string

# Or individual database variables
DB_USER=your_database_user
DB_HOST=your_database_host
DB_NAME=bd_ticketpro
DB_PASSWORD=your_database_password
DB_PORT=5432

# Security
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Server
NODE_ENV=production
PORT=3000
```

## PostgreSQL Database Setup

The application will automatically create tables on first run. However, you need to:

1. **Create the database**:
   ```sql
   CREATE DATABASE bd_ticketpro;
   ```

2. **(Optional) Create a dedicated user**:
   ```sql
   CREATE USER bd_ticketpro_user WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE bd_ticketpro TO bd_ticketpro_user;
   ```

## Custom Domain (Optional)

Most deployment platforms allow you to add a custom domain:

1. In your deployment platform, find the "Custom Domain" settings
2. Add your domain name
3. Follow the instructions to configure DNS records

## Monitoring and Logs

Most platforms provide:
- Real-time logs
- Performance metrics
- Error tracking
- Uptime monitoring

Check your deployment platform's documentation for specific monitoring features.

## Scaling

For production usage:
1. Upgrade to a paid plan for better resources
2. Consider adding a CDN for static assets
3. Use a managed PostgreSQL service for better performance
4. Add caching mechanisms (Redis) for better performance

## Troubleshooting

### Common Issues

1. **Database Connection Failed**:
   - Check your database credentials
   - Ensure the database is running
   - Verify network access between your app and database

2. **Environment Variables Not Set**:
   - Double-check all required environment variables
   - Ensure there are no extra spaces or quotes

3. **Build Failures**:
   - Check build logs for specific errors
   - Ensure all dependencies are correctly specified in package.json

4. **Application Not Starting**:
   - Check runtime logs
   - Verify the PORT environment variable
   - Ensure the start script in package.json is correct

### Getting Help

If you encounter issues:
1. Check the platform's documentation
2. Review application logs
3. Verify all environment variables are set correctly
4. Ensure the database is accessible
5. Check that all required ports are open

## Maintenance

Regular maintenance tasks:
1. Monitor application logs
2. Check database performance
3. Update dependencies regularly
4. Backup database periodically
5. Monitor resource usage

This deployment guide should help you successfully publish your BD TicketPro application online.
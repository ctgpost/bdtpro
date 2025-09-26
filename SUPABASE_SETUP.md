# Supabase Setup Guide for BD TicketPro

## 🚀 Setting up Supabase for BD TicketPro

This guide will help you set up a Supabase database for your BD TicketPro application.

## Step 1: Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and sign up for an account
2. Click "New Project"
3. Choose your organization or create a new one
4. Enter a name for your project (e.g., "bd-ticketpro")
5. Select a region closest to your users
6. Set a strong database password and save it securely
7. Click "Create new project"

## Step 2: Get Your Database Connection String

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Settings" (gear icon)
3. Click on "Database" under Settings
4. Scroll down to "Connection string"
5. Copy the "URI" connection string
6. It will look like this:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 3: Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your BD TicketPro project
3. Go to "Settings" > "Environment Variables"
4. Add the following variables:

### Required Variables:

```
NODE_ENV=production
JWT_SECRET=your-very-secure-jwt-secret-minimum-32-characters
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### How to Generate a Secure JWT_SECRET:

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Configure Supabase Database Settings

To ensure the application works properly with Supabase, you may need to adjust some database settings:

1. In your Supabase project dashboard, go to "SQL Editor"
2. You may need to enable some extensions if they're not already enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

## Step 5: Deploy Your Application

1. Make sure all environment variables are set in Vercel
2. Trigger a new deployment by pushing a small change to your GitHub repository:
   ```bash
   git commit --allow-empty -m "Trigger deployment for Supabase setup"
   git push origin main
   ```
3. Or redeploy from the Vercel dashboard

## 🔧 Troubleshooting Supabase Connection Issues

### Issue: Connection timeout or SSL errors

If you encounter connection issues, try adding these additional parameters to your connection string:
```
?sslmode=require&connection_limit=1
```

So your DATABASE_URL would look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require&connection_limit=1
```

### Issue: Permission denied errors

Supabase usually works out of the box with the connection settings in this project. If you encounter permission issues:

1. Make sure you're using the correct password
2. Check that your Supabase project is fully provisioned
3. Ensure your IP is not blocked by Supabase's security settings

## 🔄 Database Migration

The BD TicketPro application will automatically create all necessary tables on first run. However, if you want to manually create the tables:

1. Go to your Supabase dashboard
2. Open the "SQL Editor"
3. Run the table creation scripts found in the `setup-db.sql` file in this repository

## 🔒 Security Considerations

1. **Never expose your DATABASE_URL publicly**
2. **Use strong, unique passwords**
3. **Regularly rotate your JWT_SECRET**
4. **Enable Supabase's built-in security features**

## 📞 Support

If you encounter any issues with your Supabase setup:

1. Check the Vercel deployment logs
2. Check the Supabase project logs
3. Verify your environment variables are correctly set
4. Ensure your Supabase project is not paused due to inactivity

For more information about Supabase, visit the [Supabase Documentation](https://supabase.com/docs).
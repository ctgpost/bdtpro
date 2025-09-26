# BD TicketPro - Vercel Deployment Guide

## 🚀 Vercel Deployment Process

### Step 1: Repository Preparation

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

### Step 2: Vercel Account Setup

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Import Project"
4. Select your GitHub repository

### Step 3: Project Configuration

When importing on Vercel:

1. **Project Name:** `bd-ticketpro` (or your preferred name)
2. **Framework:** Other (manual configuration)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist/spa`

### Step 4: Environment Variables Setup

Add these environment variables in the Vercel Dashboard:

**For Supabase Database:**

```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters
DATABASE_URL=your-supabase-database-connection-string
```

**How to get your Supabase DATABASE_URL:**

1. Go to your Supabase project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "Database"
4. Find "Connection string" and copy the "URI" version
5. It will look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

**Optional Variables:**

```
DEBUG=false
CORS_ORIGINS=https://your-app-name.vercel.app
```

### Step 5: Supabase Configuration

Before deploying, you need to set up your Supabase project:

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Get your database connection string from the Supabase dashboard
3. Add the connection string as DATABASE_URL in Vercel environment variables

### Step 6: Deployment

1. Click "Deploy" button
2. Wait for build process to complete (5-10 minutes)
3. You'll get your app URL when deployment is successful

## 🔧 Post-Deployment Configuration

### Database Initialization

The application will automatically create the necessary tables when it first starts. However, you may need to ensure your Supabase database allows the required operations.

### Default Login Credentials

```
Username: admin
Password: admin123
```

**⚠️ Security Warning:** Change the default password immediately after first login!

## 📝 Environment Variables Details

### Generating JWT_SECRET:

```bash
# Run in terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS_ORIGINS Configuration:

```
# For multiple domains
CORS_ORIGINS=https://your-app.vercel.app,https://custom-domain.com,https://www.custom-domain.com
```

## 🚨 Common Issues and Solutions

### 1. Build Failed

- **Problem:** Node.js version mismatch
- **Solution:** Set Node.js version to 20.x in Vercel dashboard

### 2. API Routes Not Working

- **Problem:** Function timeout
- **Solution:** Increase maxDuration in vercel.json if needed

### 3. Database Connection Error

- **Problem:** Incorrect database configuration
- **Solution:** Verify DATABASE_URL is correctly set with proper credentials

### 4. Authentication Not Working

- **Problem:** Missing JWT_SECRET
- **Solution:** Ensure JWT_SECRET environment variable is properly set

### 5. Supabase Connection Issues

- **Problem:** Connection pooling or SSL settings
- **Solution:** The application is already configured to work with Supabase's requirements

## 🔄 Re-deployment Process

After updating code:

1. **Test locally:**

   ```bash
   npm run build
   npm run start
   ```

2. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

3. **Vercel will automatically re-deploy** (1-2 minutes)

## 📊 Performance Monitoring

Monitor in Vercel Dashboard:

- **Function Execution Time**
- **Bandwidth Usage**
- **Error Logs**
- **Analytics**

## 🔒 Security Checklist

- ✅ JWT_SECRET properly set
- ✅ CORS_ORIGINS configured
- ✅ Default admin password changed
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Security headers configured

## 📞 Support

If you encounter issues:

1. Check Vercel Function Logs
2. Check Browser Console for errors
3. Check Network tab for API responses

## 🎉 Success!

Once successfully deployed, your Travel Agency Management System will be ready!

**Features Available:**

- ✅ Dashboard
- ✅ Countries Management
- ✅ Tickets Management
- ✅ Admin Buying
- ✅ Bookings
- ✅ Umrah Management
- ✅ Reports
- ✅ Settings

**Production URL:** `https://your-app-name.vercel.app`
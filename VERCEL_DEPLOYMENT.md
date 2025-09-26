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

**Required Variables:**

```
NODE_ENV=production
JWT_SECRET=your-secure-jwt-secret-key-minimum-32-characters
DB_USER=your-database-username
DB_HOST=your-database-host
DB_NAME=your-database-name
DB_PASSWORD=your-database-password
DB_PORT=5432
```

**Optional Variables:**

```
DEBUG=false
CORS_ORIGINS=https://your-app-name.vercel.app
```

### ধাপ ৫: Deployment

1. "Deploy" বাটন ক্লিক করুন
2. Build process সম্পূর্ণ হওয়ার জন্য অপেক্ষা করুন (৫-১�� মিনিট)
3. Deployment সফল হলে আপনার app URL পাবেন

## 🔧 Post-Deployment Configuration

### Database Setup

For PostgreSQL database:

1. Set up a PostgreSQL database (you can use services like Supabase, Railway, or any PostgreSQL provider)
2. Add the database connection details in Vercel environment variables
3. The application will automatically initialize the database tables on first access

### Default Login Credentials

```
Username: admin
Password: admin123
```

**⚠️ Security Warning:** First login এর পর অবশ্যই password change করুন!

## 📝 Environment Variables বিস্তারিত

### JWT_SECRET তৈরি করার উপায়:

```bash
# Terminal এ run করুন (নিরাপদ secret তৈরির জন্য)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### CORS_ORIGINS Configuration:

```
# একাধিক domain এর জন্য
CORS_ORIGINS=https://your-app.vercel.app,https://custom-domain.com,https://www.custom-domain.com
```

## 🚨 Common Issues এবং Solutions

### ১. Build Failed

- **সমস্যা:** Node.js version mismatch
- **সমাধান:** Vercel dashboard এ Node.js version 20.x set কর��ন

### ২. API Routes না কাজ করা

- **সমস্যা:** Function timeout
- **সমাধান:** vercel.json এ maxDuration increase করুন

### 3. Database Connection Error

- **Problem:** Incorrect database configuration
- **Solution:** Verify all database environment variables are correctly set

### ৪. Authentication না কাজ করা

- **সমস্যা:** JWT_SECRET missing
- **সমাধান:** Environment variables properly set করুন

## 🔄 Re-deployment Process

Code update করার পর:

1. **Local এ test করুন:**

   ```bash
   npm run build
   npm run start
   ```

2. **GitHub এ push করুন:**

   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push origin main
   ```

3. **Vercel automatically re-deploy করবে** (1-2 মিনিট)

## 📊 Performance Monitoring

Vercel Dashboard এ monitor করতে পারেন:

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

যদি কোন সমস্যা হয়:

1. Vercel Function Logs check করুন
2. Browser Console এ error দেখুন
3. Network tab এ API responses check করুন

## 🎉 Success!

সফলভাবে deploy হলে আপনার Travel Agency Management System ready!

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

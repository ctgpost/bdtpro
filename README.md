# BD TicketPro - Frontend Only Version

This is a frontend-only version of the BD TicketPro Travel Agency Management System. All backend functionality has been replaced with simulated data to demonstrate the UI/UX without requiring a server.

## 🚀 Features

- **Authentication System** - Login with demo accounts
- **Dashboard** - Overview of ticket inventory and bookings
- **Countries Management** - View countries with ticket availability
- **Ticket Management** - Manage tickets by country
- **Booking System** - Create and manage customer bookings
- **Admin Buying** - Simulate ticket batch purchases
- **Umrah Management** - Specialized management for Umrah packages
- **Reports** - View business analytics and reports
- **Settings** - Configure application settings

## 🎯 Demo Accounts

You can log in with any of these demo accounts:

- **Admin**: username `admin`, password `admin123`
- **Manager**: username `manager`, password `manager123`
- **Staff**: username `staff`, password `staff123`

You can also use any username with password `demo` for quick access.

## 🛠️ Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
client/
  ├── components/     # Reusable UI components
  ├── context/        # React context providers (Auth)
  ├── hooks/          # Custom React hooks
  ├── lib/            # Utility functions
  ├── pages/          # Page components
  ├── services/       # API service layer
  └── App.tsx         # Main application component
```

## 🎨 UI Components

The application uses a comprehensive set of UI components built with:
- Radix UI for accessible primitives
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🔐 Authentication

The authentication system simulates login/logout functionality without a backend. User data is stored in localStorage for demonstration purposes.

## 📊 Data Simulation

All data is simulated in the frontend:
- Countries, tickets, and bookings are stored in memory
- CRUD operations update the in-memory data
- Changes persist during the session but are not saved between sessions

## 🚀 Deployment

To deploy this frontend-only application:
1. Build the project: `npm run build`
2. Deploy the `dist/spa` folder to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)

### Vercel Deployment

The project is now properly configured for Vercel deployment:
- Fixed entry point issues
- Correct build output directory (`dist/spa`)
- Proper routing configuration in `vercel.json`

## 📞 Support

For issues with the frontend application, please create an issue in the repository.
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { initializeDatabase } from "./database/schema";

// Import API routes
import authRoutes from "./routes/auth";
import ticketRoutes from "./routes/tickets";
import ticketBatchRoutes from "./routes/ticket-batches";
import bookingRoutes from "./routes/bookings";
import userRoutes from "./routes/users";
import settingsRoutes from "./routes/settings";
import umrahRoutes from "./routes/umrah";

export async function createServer() {
  const app = express();

  // Initialize database
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }

  // Middleware
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? [process.env.FRONTEND_URL || ""] // Add your production frontend URL
          : ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    res.json({
      message: "BD TicketPro API Server",
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/batches", ticketBatchRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/umrah", umrahRoutes);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const frontendPath = path.join(__dirname, "..", "dist", "spa");
    
    // Serve static files
    app.use(express.static(frontendPath));
    
    // Handle React Router
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  });

  // Global error handler
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  });

  return app;
}

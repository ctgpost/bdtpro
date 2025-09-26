import {
  CreateTicketBatchRequest,
  CreateBookingRequest,
  DashboardStats,
  CountriesResponse,
  TicketsResponse,
  BookingResponse,
  TicketBatchResponse,
} from "@/shared/api";

// Define types directly in this file instead of importing from shared
type UserRole = "admin" | "manager" | "staff";

interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// API configuration
const API_BASE_URL = "/api";

// Store original fetch before any third-party scripts can override it
const originalFetch = window.fetch.bind(window);
(window as any).__originalFetch = originalFetch;

// Simple frontend-only API client that simulates backend responses

// Demo data
const DEMO_COUNTRIES = [
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", totalTickets: 150, availableTickets: 85 },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", totalTickets: 95, availableTickets: 42 },
  { code: "TR", name: "Turkey", flag: "🇹🇷", totalTickets: 75, availableTickets: 30 },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", totalTickets: 120, availableTickets: 75 },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", totalTickets: 80, availableTickets: 25 },
];

const DEMO_TICKETS = [
  { id: "1", batchId: "B001", country: "SA", ticketNumber: "SA-00001", status: "available" as const, sellingPrice: 850 },
  { id: "2", batchId: "B001", country: "SA", ticketNumber: "SA-00002", status: "booked" as const, sellingPrice: 850 },
  { id: "3", batchId: "B002", country: "AE", ticketNumber: "AE-00001", status: "available" as const, sellingPrice: 720 },
  { id: "4", batchId: "B003", country: "TR", ticketNumber: "TR-00001", status: "sold" as const, sellingPrice: 650 },
];

const DEMO_BATCHES = [
  { 
    id: "B001", 
    country: "SA", 
    airline: "Saudi Airlines", 
    flightDate: "2025-10-15", 
    flightTime: "14:30", 
    buyingPrice: 650, 
    quantity: 50, 
    agentName: "Saudi Travel Agency", 
    createdAt: "2025-09-01", 
    createdBy: "admin" 
  },
  { 
    id: "B002", 
    country: "AE", 
    airline: "Emirates", 
    flightDate: "2025-10-20", 
    flightTime: "10:15", 
    buyingPrice: 580, 
    quantity: 30, 
    agentName: "Dubai Connect", 
    createdAt: "2025-09-05", 
    createdBy: "admin" 
  },
];

const DEMO_BOOKINGS = [
  { 
    id: "BK001", 
    customerName: "Ahmed Hassan", 
    ticketId: "2", 
    bookingDate: "2025-09-20", 
    travelDate: "2025-10-15", 
    amount: 850, 
    status: "confirmed" as const 
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class APIClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage if available
    this.authToken = localStorage.getItem("bd_ticket_pro_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ success: boolean; message: string; data?: T; errors?: any[] }> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log(`API Request: ${options.method || "GET"} ${url}`);

      // Use stored original fetch to bypass third-party script interference
      const response = await originalFetch(url, config);
      console.log(`API Response: ${response.status} ${response.statusText}`);

      // Check if response has content
      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          // If JSON parsing fails, create a fallback result without reading body again
          result = {
            success: response.ok,
            message: `Failed to parse JSON response: ${response.status}`,
          };
        }
      } else {
        // Non-JSON response
        const text = await response.text();
        result = {
          success: response.ok,
          message: text || `HTTP ${response.status}`,
          data: text,
        };
      }

      if (!response.ok) {
        // If unauthorized, clear authentication data
        if (response.status === 401) {
          this.authToken = null;
          localStorage.removeItem("bd_ticket_pro_token");
          localStorage.removeItem("bd_ticket_pro_user");
        }
        // Better error message for validation errors
        let errorMessage =
          result.message || `HTTP error! status: ${response.status}`;

        // If it's a validation error with specific field errors
        if (result.errors && Array.isArray(result.errors)) {
          const fieldErrors = result.errors
            .map(
              (err: any) =>
                `${err.path?.join?.(".") || "Field"}: ${err.message}`,
            )
            .join(", ");
          errorMessage = `Validation error: ${fieldErrors}`;
        }

        throw new Error(errorMessage);
      }

      return result;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);

      // Check if it's a network error
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        console.error(
          "Network error detected. Server may be down or unreachable.",
        );
        throw new Error(
          "Unable to connect to server. Please check your connection and try again.",
        );
      }

      throw error;
    }
  }

  // Authentication methods
  async login(credentials: { username: string; password: string }) {
    await delay(500);
    
    // Demo login - accept any of the predefined users
    const validUsers: Record<string, any> = {
      admin: {
        user: {
          id: "1",
          username: "admin",
          role: "admin",
          name: "Admin User",
          email: "admin@example.com",
          phone: "+1234567890",
          createdAt: new Date().toISOString(),
        },
        token: "demo-jwt-token-admin"
      },
      manager: {
        user: {
          id: "2",
          username: "manager",
          role: "manager",
          name: "Manager User",
          email: "manager@example.com",
          phone: "+1234567891",
          createdAt: new Date().toISOString(),
        },
        token: "demo-jwt-token-manager"
      },
      staff: {
        user: {
          id: "3",
          username: "staff",
          role: "staff",
          name: "Staff User",
          email: "staff@example.com",
          phone: "+1234567892",
          createdAt: new Date().toISOString(),
        },
        token: "demo-jwt-token-staff"
      }
    };
    
    if (validUsers[credentials.username] && credentials.password === `${credentials.username}123`) {
      return validUsers[credentials.username];
    }
    
    // Also accept the bypass login for any username with password "demo"
    if (credentials.password === "demo") {
      return {
        user: {
          id: "demo-" + Date.now(),
          username: credentials.username,
          role: "admin",
          name: `${credentials.username} (Demo)`,
          email: `${credentials.username}@demo.com`,
          createdAt: new Date().toISOString(),
        },
        token: "demo-jwt-token-demo"
      };
    }
    
    throw new Error("Invalid username or password");
  }

  async logout() {
    await delay(100);
    return { success: true };
  }

  async getCurrentUser() {
    await delay(200);
    const userData = localStorage.getItem("bd_ticket_pro_user");
    if (userData) {
      return JSON.parse(userData);
    }
    throw new Error("Not authenticated");
  }

  // Dashboard methods
  async getDashboardStats() {
    await delay(300);
    return {
      totalTickets: 500,
      availableTickets: 280,
      bookedTickets: 150,
      soldTickets: 70,
      totalBookings: 220,
      recentActivity: [
        { id: 1, action: "Ticket booked", user: "Staff User", time: "2 mins ago" },
        { id: 2, action: "New ticket batch", user: "Admin User", time: "1 hour ago" },
        { id: 3, action: "Payment received", user: "Manager User", time: "3 hours ago" },
      ]
    };
  }

  // Countries methods
  async getCountries() {
    await delay(300);
    return DEMO_COUNTRIES;
  }

  // Tickets methods
  async getTickets(filters?: { country?: string }) {
    await delay(300);
    if (filters?.country) {
      return DEMO_TICKETS.filter(ticket => ticket.country === filters.country);
    }
    return DEMO_TICKETS;
  }

  async getTicketsByCountry(
    countryCode: string,
    filters?: {
      status?: string;
      airline?: string;
    },
  ): Promise<TicketsResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/tickets/country/${countryCode}${params.toString() ? `?${params.toString()}` : ""}`;
    const result = await this.request<TicketsResponse>(endpoint);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get country tickets");
  }

  async getAllTickets(filters?: {
    status?: string;
    airline?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/tickets/all${params.toString() ? `?${params.toString()}` : ""}`;
    const result = await this.request<any>(endpoint);

    if (result.success && result.data) {
      return result.data.tickets || [];
    }
    throw new Error(result.message || "Failed to get all tickets");
  }

  async getTicketById(id: string): Promise<any> {
    const result = await this.request<any>(`/tickets/${id}`);
    if (result.success && result.data) {
      return result.data.ticket;
    }
    throw new Error(result.message || "Failed to get ticket");
  }

  async updateTicketStatus(id: string, status: string): Promise<void> {
    const result = await this.request(`/tickets/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update ticket status");
    }
  }

  // Ticket Batch methods
  async getTicketBatches() {
    await delay(300);
    return DEMO_BATCHES;
  }

  async createTicketBatch(batchData: any) {
    await delay(500);
    return {
      success: true,
      message: "Ticket batch created successfully",
      data: {
        id: "B" + (DEMO_BATCHES.length + 1).toString().padStart(3, "0"),
        ...batchData,
        createdAt: new Date().toISOString(),
        createdBy: "current-user"
      }
    };
  }

  // Booking Management API functions
  async getBookings(): Promise<any[]> {
    // Simulate API delay
    await delay(300);
    
    // Return demo data
    return [
      {
        id: "1",
        ticket_id: "SA001",
        customer_name: "Md. Rahman",
        customer_email: "rahman@example.com",
        customer_phone: "+8801712345678",
        country_code: "SA",
        ticket_type: "Economy",
        departure_date: "2025-10-15",
        return_date: "2025-10-25",
        total_amount: 85000,
        amount_paid: 85000,
        status: "confirmed",
        agent_id: "agent001",
        agent_name: "Travel Agent 1",
        notes: "Full payment received",
        created_at: "2025-09-20T10:30:00Z",
        updated_at: "2025-09-20T10:30:00Z"
      },
      {
        id: "2",
        ticket_id: "SA002",
        customer_name: "Fatema Begum",
        customer_email: "fatema@example.com",
        customer_phone: "+8801987654321",
        country_code: "SA",
        ticket_type: "Business",
        departure_date: "2025-10-18",
        return_date: "2025-10-28",
        total_amount: 150000,
        amount_paid: 75000,
        status: "pending",
        agent_id: "agent002",
        agent_name: "Travel Agent 2",
        notes: "50% advance payment received",
        created_at: "2025-09-22T14:15:00Z",
        updated_at: "2025-09-22T14:15:00Z"
      },
      {
        id: "3",
        ticket_id: "AE001",
        customer_name: "Ahmed Hossain",
        customer_email: "ahmed@example.com",
        customer_phone: "+8801612345678",
        country_code: "AE",
        ticket_type: "Economy",
        departure_date: "2025-11-05",
        return_date: "2025-11-15",
        total_amount: 75000,
        amount_paid: 0,
        status: "pending",
        agent_id: "agent001",
        agent_name: "Travel Agent 1",
        notes: "Booking confirmed, payment pending",
        created_at: "2025-09-25T09:45:00Z",
        updated_at: "2025-09-25T09:45:00Z"
      },
      {
        id: "4",
        ticket_id: "SA003",
        customer_name: "Tasnim Khan",
        customer_email: "tasnim@example.com",
        customer_phone: "+8801555555555",
        country_code: "SA",
        ticket_type: "First Class",
        departure_date: "2025-09-10",
        return_date: "2025-09-20",
        total_amount: 200000,
        amount_paid: 200000,
        status: "cancelled",
        agent_id: "agent003",
        agent_name: "Travel Agent 3",
        notes: "Customer cancelled due to personal reasons",
        created_at: "2025-09-01T11:20:00Z",
        updated_at: "2025-09-15T16:30:00Z"
      }
    ];
  }

  async getBookingById(id: string): Promise<any> {
    // Simulate API delay
    await delay(300);
    
    // Return demo data for a specific booking
    const bookings = await this.getBookings();
    const booking = bookings.find(b => b.id === id);
    
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    return booking;
  }

  async createBooking(data: any): Promise<any> {
    // Simulate API delay
    await delay(500);
    
    // Return created booking with ID and timestamps
    return {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  async updateBooking(id: string, data: any): Promise<any> {
    // Simulate API delay
    await delay(500);
    
    // Return updated booking
    return {
      id,
      ...data,
      updated_at: new Date().toISOString()
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<any> {
    // Simulate API delay
    await delay(500);
    
    // Return booking with updated status
    return {
      id,
      status,
      updated_at: new Date().toISOString()
    };
  }

  async cancelBooking(id: string): Promise<any> {
    // Simulate API delay
    await delay(500);
    
    // Return booking with cancelled status
    return {
      id,
      status: "cancelled",
      updated_at: new Date().toISOString()
    };
  }

  // User management methods
  async getUsers(): Promise<any> {
    const result = await this.request<any>("/users");
    if (result.success && result.data) {
      return result.data.users || [];
    }
    throw new Error(result.message || "Failed to get users");
  }

  async createUser(userData: any): Promise<any> {
    const result = await this.request<any>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create user");
  }

  async updateUser(id: string, updates: any): Promise<any> {
    const result = await this.request<any>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update user");
  }

  async updateProfile(updates: any): Promise<any> {
    const result = await this.request<any>("/users/profile/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update profile");
  }

  async updatePassword(passwordData: any): Promise<void> {
    const result = await this.request("/users/profile/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update password");
    }
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.request(`/users/${id}`, {
      method: "DELETE",
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to delete user");
    }
  }

  // System settings methods
  async getSettings(): Promise<any> {
    const result = await this.request<any>("/settings");
    if (result.success && result.data) {
      return { settings: result.data.settings || [] };
    }
    throw new Error(result.message || "Failed to get settings");
  }

  async updateSettings(settings: any): Promise<void> {
    const result = await this.request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update settings");
    }
  }

  async exportData(format: "json" | "csv" = "json"): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/settings/export/data?format=${format}`,
      {
        headers: {
          ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    return response.blob();
  }

  async getActivityLogs(filters?: {
    limit?: number;
    user_id?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/settings/logs/activity${params.toString() ? `?${params.toString()}` : ""}`;
    const result = await this.request<any>(endpoint);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get activity logs");
  }

  // System information methods
  async getSystemInfo(): Promise<any> {
    const result = await this.request<any>("/settings/system-info");

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get system information");
  }

  // Backup methods
  async createBackup(): Promise<any> {
    const result = await this.request<any>("/settings/backup", {
      method: "POST",
    });

    if (result.success) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create backup");
  }

  // Umrah With Transport methods
  private DEMO_UMRAH_WITH_TRANSPORT = [
    {
      id: "1",
      passenger_name: "Md. Abdullah Al Mamun",
      pnr: "ABC123XYZ",
      passport_number: "P12345678",
      flight_airline_name: "Saudi Airlines",
      departure_date: "2025-10-15",
      return_date: "2025-10-25",
      approved_by: "Travel Agency",
      reference_agency: "Dhaka Travel",
      emergency_flight_contact: "+8801712345678",
      passenger_mobile: "+8801987654321",
      created_at: "2025-09-20T10:30:00Z",
      updated_at: "2025-09-20T10:30:00Z"
    },
    {
      id: "2",
      passenger_name: "Fatema Begum",
      pnr: "DEF456UVW",
      passport_number: "P87654321",
      flight_airline_name: "Emirates",
      departure_date: "2025-11-05",
      return_date: "2025-11-15",
      approved_by: "Travel Agency",
      reference_agency: "Chittagong Tours",
      emergency_flight_contact: "+8801612345678",
      passenger_mobile: "+8801876543210",
      created_at: "2025-09-18T14:15:00Z",
      updated_at: "2025-09-18T14:15:00Z"
    }
  ];

  async getUmrahWithTransport(search?: string): Promise<any> {
    await delay(300);
    
    // Filter demo data based on search term
    if (search) {
      const searchLower = search.toLowerCase();
      return this.DEMO_UMRAH_WITH_TRANSPORT.filter(pkg => 
        pkg.passenger_name.toLowerCase().includes(searchLower) ||
        pkg.pnr.toLowerCase().includes(searchLower) ||
        pkg.passport_number.toLowerCase().includes(searchLower)
      );
    }
    
    return this.DEMO_UMRAH_WITH_TRANSPORT;
  }

  async getUmrahWithTransportById(id: string): Promise<any> {
    await delay(300);
    const packageData = this.DEMO_UMRAH_WITH_TRANSPORT.find(pkg => pkg.id === id);
    
    if (packageData) {
      return packageData;
    }
    throw new Error("Package not found");
  }

  async createUmrahWithTransport(packageData: {
    passenger_name: string;
    pnr: string;
    passport_number: string;
    flight_airline_name: string;
    departure_date: string;
    return_date: string;
    approved_by: string;
    reference_agency: string;
    emergency_flight_contact: string;
    passenger_mobile: string;
    group_ticket_id?: string;
  }): Promise<any> {
    await delay(500);
    
    const newPackage = {
      id: `UMRAH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...packageData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to demo data array
    this.DEMO_UMRAH_WITH_TRANSPORT.push(newPackage);
    
    return newPackage;
  }

  async updateUmrahWithTransport(id: string, packageData: any): Promise<any> {
    await delay(500);
    
    const index = this.DEMO_UMRAH_WITH_TRANSPORT.findIndex(pkg => pkg.id === id);
    
    if (index !== -1) {
      const updatedPackage = {
        ...this.DEMO_UMRAH_WITH_TRANSPORT[index],
        ...packageData,
        updated_at: new Date().toISOString()
      };
      
      this.DEMO_UMRAH_WITH_TRANSPORT[index] = updatedPackage;
      return updatedPackage;
    }
    
    throw new Error("Package not found");
  }

  async deleteUmrahWithTransport(id: string): Promise<void> {
    await delay(300);
    
    const initialLength = this.DEMO_UMRAH_WITH_TRANSPORT.length;
    this.DEMO_UMRAH_WITH_TRANSPORT = this.DEMO_UMRAH_WITH_TRANSPORT.filter(pkg => pkg.id !== id);
    
    if (this.DEMO_UMRAH_WITH_TRANSPORT.length === initialLength) {
      throw new Error("Package not found");
    }
  }

  // Umrah Without Transport methods
  private DEMO_UMRAH_WITHOUT_TRANSPORT = [
    {
      id: "1",
      flight_departure_date: "2025-10-20",
      return_date: "2025-10-30",
      passenger_name: "Ahmed Hossain",
      passport_number: "P11223344",
      entry_recorded_by: "Staff User",
      total_amount: 85000,
      amount_paid: 50000,
      remaining_amount: 35000,
      last_payment_date: "2025-09-25",
      remarks: "Partial payment received",
      created_at: "2025-09-15T09:45:00Z",
      updated_at: "2025-09-25T11:20:00Z"
    }
  ];

  async getUmrahWithoutTransport(
    search?: string,
    pendingOnly?: boolean,
  ): Promise<any> {
    await delay(300);
    
    // Filter demo data based on search term and pending status
    let filteredData = [...this.DEMO_UMRAH_WITHOUT_TRANSPORT];
    
    if (pendingOnly) {
      filteredData = filteredData.filter(pkg => pkg.amount_paid < pkg.total_amount);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(pkg => 
        pkg.passenger_name.toLowerCase().includes(searchLower) ||
        pkg.passport_number.toLowerCase().includes(searchLower) ||
        pkg.remarks?.toLowerCase().includes(searchLower) || false
      );
    }
    
    return filteredData;
  }

  async getUmrahWithoutTransportById(id: string): Promise<any> {
    await delay(300);
    const packageData = this.DEMO_UMRAH_WITHOUT_TRANSPORT.find(pkg => pkg.id === id);
    
    if (packageData) {
      return packageData;
    }
    throw new Error("Package not found");
  }

  async createUmrahWithoutTransport(packageData: {
    flight_departure_date: string;
    return_date: string;
    passenger_name: string;
    passport_number: string;
    entry_recorded_by: string;
    total_amount: number;
    amount_paid: number;
    last_payment_date?: string;
    remarks?: string;
    group_ticket_id?: string;
  }): Promise<any> {
    await delay(500);
    
    const newPackage = {
      id: `UMRAH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...packageData,
      remaining_amount: packageData.total_amount - packageData.amount_paid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to demo data array
    this.DEMO_UMRAH_WITHOUT_TRANSPORT.push(newPackage);
    
    return newPackage;
  }

  async updateUmrahWithoutTransport(
    id: string,
    packageData: any,
  ): Promise<any> {
    await delay(500);
    
    const index = this.DEMO_UMRAH_WITHOUT_TRANSPORT.findIndex(pkg => pkg.id === id);
    
    if (index !== -1) {
      const updatedPackage = {
        ...this.DEMO_UMRAH_WITHOUT_TRANSPORT[index],
        ...packageData,
        remaining_amount: packageData.total_amount - packageData.amount_paid,
        updated_at: new Date().toISOString()
      };
      
      this.DEMO_UMRAH_WITHOUT_TRANSPORT[index] = updatedPackage;
      return updatedPackage;
    }
    
    throw new Error("Package not found");
  }

  async recordUmrahPayment(
    id: string,
    paymentData: {
      amount: number;
      payment_date?: string;
    },
  ): Promise<any> {
    await delay(300);
    
    const index = this.DEMO_UMRAH_WITHOUT_TRANSPORT.findIndex(pkg => pkg.id === id);
    
    if (index !== -1) {
      const currentPackage = this.DEMO_UMRAH_WITHOUT_TRANSPORT[index];
      
      // Update payment information
      const updatedPackage = {
        ...currentPackage,
        amount_paid: currentPackage.amount_paid + paymentData.amount,
        remaining_amount: currentPackage.remaining_amount - paymentData.amount,
        last_payment_date: paymentData.payment_date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      this.DEMO_UMRAH_WITHOUT_TRANSPORT[index] = updatedPackage;
      return updatedPackage;
    }
    
    throw new Error("Package not found");
  }

  async deleteUmrahWithoutTransport(id: string): Promise<void> {
    await delay(300);
    
    const initialLength = this.DEMO_UMRAH_WITHOUT_TRANSPORT.length;
    this.DEMO_UMRAH_WITHOUT_TRANSPORT = this.DEMO_UMRAH_WITHOUT_TRANSPORT.filter(pkg => pkg.id !== id);
    
    if (this.DEMO_UMRAH_WITHOUT_TRANSPORT.length === initialLength) {
      throw new Error("Package not found");
    }
  }

  // Umrah statistics and summary methods
  async getUmrahPaymentSummary(): Promise<any> {
    const result = await this.request<any>("/umrah/payment-summary");

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get payment summary");
  }

  async getUmrahStats(): Promise<any> {
    const result = await this.request<any>("/umrah/stats");

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get umrah statistics");
  }

  // Umrah Group Ticket methods
  private DEMO_UMRAH_GROUP_TICKETS = [
    {
      id: "1",
      group_name: "Ramadan Special Group",
      package_type: "with-transport",
      departure_date: "2025-10-15",
      return_date: "2025-10-25",
      ticket_count: 50,
      total_cost: 4000000,
      average_cost_per_ticket: 80000,
      agent_name: "Premium Travel Agency",
      agent_contact: "+8801711111111",
      purchase_notes: "Early bird booking with 10% discount",
      departure_airline: "Saudi Airlines",
      departure_flight_number: "SA123",
      departure_time: "02:30",
      departure_route: "DAC-JED",
      return_airline: "Saudi Airlines",
      return_flight_number: "SA456",
      return_time: "18:45",
      return_route: "JED-DAC",
      remaining_tickets: 25,
      created_at: "2025-09-01T08:30:00Z",
      updated_at: "2025-09-01T08:30:00Z"
    },
    {
      id: "2",
      group_name: "October Group Package",
      package_type: "with-transport",
      departure_date: "2025-10-20",
      return_date: "2025-10-30",
      ticket_count: 30,
      total_cost: 2500000,
      average_cost_per_ticket: 83333,
      agent_name: "Budget Tours",
      agent_contact: "+8801822222222",
      purchase_notes: "Standard package without extra amenities",
      departure_airline: "Emirates",
      departure_flight_number: "EK789",
      departure_time: "22:15",
      departure_route: "DAC-DXB-JED",
      return_airline: "Emirates",
      return_flight_number: "EK101",
      return_time: "15:30",
      return_route: "JED-DXB-DAC",
      remaining_tickets: 15,
      created_at: "2025-09-10T16:45:00Z",
      updated_at: "2025-09-10T16:45:00Z"
    }
  ];

  async getUmrahGroupTickets(
    packageType?: string,
    search?: string,
  ): Promise<any> {
    await delay(300);
    
    // Filter demo data based on package type and search term
    let filteredData = [...this.DEMO_UMRAH_GROUP_TICKETS];
    
    if (packageType) {
      filteredData = filteredData.filter(ticket => ticket.package_type === packageType);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(ticket => 
        ticket.group_name.toLowerCase().includes(searchLower) ||
        ticket.agent_name.toLowerCase().includes(searchLower)
      );
    }
    
    return filteredData;
  }

  async getUmrahGroupTicketsByDates(packageType: string): Promise<any> {
    await delay(300);
    
    // Group tickets by departure and return dates
    const groupedData: any[] = [];
    const dateGroups: Record<string, any[]> = {};
    
    // Filter by package type first
    const filteredTickets = packageType 
      ? this.DEMO_UMRAH_GROUP_TICKETS.filter(ticket => ticket.package_type === packageType)
      : this.DEMO_UMRAH_GROUP_TICKETS;
    
    // Group by departure and return dates
    filteredTickets.forEach(ticket => {
      const key = `${ticket.departure_date}-${ticket.return_date}`;
      if (!dateGroups[key]) {
        dateGroups[key] = [];
      }
      dateGroups[key].push(ticket);
    });
    
    // Format the grouped data
    Object.entries(dateGroups).forEach(([key, tickets]) => {
      const [departure_date, return_date] = key.split('-');
      
      groupedData.push({
        departure_date,
        return_date,
        group_count: tickets.length,
        total_tickets: tickets.reduce((sum, ticket) => sum + ticket.ticket_count, 0),
        total_cost: tickets.reduce((sum, ticket) => sum + ticket.total_cost, 0),
        groups: tickets
      });
    });
    
    return groupedData;
  }

  async getUmrahGroupTicketById(id: string): Promise<any> {
    await delay(300);
    const ticket = this.DEMO_UMRAH_GROUP_TICKETS.find(t => t.id === id);
    
    if (ticket) {
      return ticket;
    }
    throw new Error("Group ticket not found");
  }

  async createUmrahGroupTicket(ticketData: {
    group_name: string;
    package_type: "with-transport" | "without-transport";
    departure_date: string;
    return_date: string;
    ticket_count: number;
    total_cost: number;
    agent_name: string;
    agent_contact?: string;
    purchase_notes?: string;
    // Flight Details
    departure_airline?: string;
    departure_flight_number?: string;
    departure_time?: string;
    departure_route?: string;
    return_airline?: string;
    return_flight_number?: string;
    return_time?: string;
    return_route?: string;
  }): Promise<any> {
    await delay(500);
    
    const newTicket = {
      id: `GROUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...ticketData,
      average_cost_per_ticket: Math.round(ticketData.total_cost / ticketData.ticket_count),
      remaining_tickets: ticketData.ticket_count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add to demo data array
    this.DEMO_UMRAH_GROUP_TICKETS.push(newTicket);
    
    return newTicket;
  }

  async updateUmrahGroupTicket(id: string, ticketData: any): Promise<any> {
    await delay(500);
    
    const index = this.DEMO_UMRAH_GROUP_TICKETS.findIndex(ticket => ticket.id === id);
    
    if (index !== -1) {
      const updatedTicket = {
        ...this.DEMO_UMRAH_GROUP_TICKETS[index],
        ...ticketData,
        average_cost_per_ticket: Math.round(ticketData.total_cost / ticketData.ticket_count),
        updated_at: new Date().toISOString()
      };
      
      this.DEMO_UMRAH_GROUP_TICKETS[index] = updatedTicket;
      return updatedTicket;
    }
    
    throw new Error("Group ticket not found");
  }

  async deleteUmrahGroupTicket(
    id: string,
    force: boolean = false,
  ): Promise<void> {
    await delay(300);
    
    const initialLength = this.DEMO_UMRAH_GROUP_TICKETS.length;
    this.DEMO_UMRAH_GROUP_TICKETS = this.DEMO_UMRAH_GROUP_TICKETS.filter(ticket => ticket.id !== id);
    
    if (this.DEMO_UMRAH_GROUP_TICKETS.length === initialLength) {
      throw new Error("Group ticket not found");
    }
  }

  async getAvailableGroupTickets(
    packageType: "with-transport" | "without-transport",
    departureDate: string,
    returnDate: string,
  ): Promise<any> {
    await delay(300);
    
    // Return demo data for available group tickets
    return [
      {
        id: "1",
        group_name: "October Special Group",
        package_type: packageType,
        departure_date: departureDate,
        return_date: returnDate,
        ticket_count: 25,
        total_cost: 2000000,
        average_cost_per_ticket: 80000,
        agent_name: "Dhaka Travel Agency",
        agent_contact: "+8801712345678",
        purchase_notes: "Special discount for early booking",
        departure_airline: "Saudi Airlines",
        departure_flight_number: "SA123",
        departure_time: "02:30",
        departure_route: "DAC-JED",
        return_airline: "Saudi Airlines",
        return_flight_number: "SA456",
        return_time: "18:45",
        return_route: "JED-DAC",
        remaining_tickets: 10,
        created_at: "2025-09-01T08:30:00Z",
        updated_at: "2025-09-01T08:30:00Z"
      }
    ];
  }

  async assignPassengerToGroup(assignmentData: {
    group_ticket_id: string;
    passenger_id: string;
    passenger_type: "with-transport" | "without-transport";
  }): Promise<any> {
    await delay(300);
    
    // Simulate successful assignment
    return {
      id: `ASSIGN-${Date.now()}`,
      ...assignmentData,
      assigned_at: new Date().toISOString()
    };
  }

  async removePassengerFromGroup(assignmentId: string): Promise<void> {
    await delay(300);
    // No return value needed for delete operations
    // In a real implementation, this would remove the assignment from the data store
  }
}

export const apiClient = new APIClient();
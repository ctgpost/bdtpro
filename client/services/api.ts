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

  // Bookings methods
  async getBookings() {
    await delay(300);
    return DEMO_BOOKINGS;
  }

  async createBooking(bookingData: any) {
    await delay(500);
    return {
      success: true,
      message: "Booking created successfully",
      data: {
        id: "BK" + (DEMO_BOOKINGS.length + 1).toString().padStart(3, "0"),
        ...bookingData,
        status: "confirmed"
      }
    };
  }

  async updateBookingStatus(id: string, status: string): Promise<void> {
    const result = await this.request(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to update booking status");
    }
  }

  async cancelBooking(id: string): Promise<void> {
    const result = await this.request(`/bookings/${id}`, {
      method: "DELETE",
    });

    if (!result.success) {
      throw new Error(result.message || "Failed to cancel booking");
    }
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
  async getUmrahWithTransport(search?: string): Promise<any> {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const result = await this.request<any>(`/umrah/with-transport${params}`);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to get umrah with transport packages",
    );
  }

  async getUmrahWithTransportById(id: string): Promise<any> {
    const result = await this.request<any>(`/umrah/with-transport/${id}`);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to get umrah with transport package",
    );
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
    group_ticket_id?: string; // For auto-deduction from group tickets
  }): Promise<any> {
    const result = await this.request<any>("/umrah/with-transport", {
      method: "POST",
      body: JSON.stringify(packageData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to create umrah with transport package",
    );
  }

  async updateUmrahWithTransport(id: string, packageData: any): Promise<any> {
    const result = await this.request<any>(`/umrah/with-transport/${id}`, {
      method: "PUT",
      body: JSON.stringify(packageData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to update umrah with transport package",
    );
  }

  async deleteUmrahWithTransport(id: string): Promise<void> {
    const result = await this.request<any>(`/umrah/with-transport/${id}`, {
      method: "DELETE",
    });

    if (!result.success) {
      throw new Error(
        result.message || "Failed to delete umrah with transport package",
      );
    }
  }

  // Umrah Without Transport methods
  async getUmrahWithoutTransport(
    search?: string,
    pendingOnly?: boolean,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (pendingOnly) params.append("pending_only", "true");

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const result = await this.request<any>(
      `/umrah/without-transport${queryString}`,
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to get umrah without transport packages",
    );
  }

  async getUmrahWithoutTransportById(id: string): Promise<any> {
    const result = await this.request<any>(`/umrah/without-transport/${id}`);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to get umrah without transport package",
    );
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
    group_ticket_id?: string; // For auto-deduction from group tickets
  }): Promise<any> {
    const result = await this.request<any>("/umrah/without-transport", {
      method: "POST",
      body: JSON.stringify(packageData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to create umrah without transport package",
    );
  }

  async updateUmrahWithoutTransport(
    id: string,
    packageData: any,
  ): Promise<any> {
    const result = await this.request<any>(`/umrah/without-transport/${id}`, {
      method: "PUT",
      body: JSON.stringify(packageData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(
      result.message || "Failed to update umrah without transport package",
    );
  }

  async recordUmrahPayment(
    id: string,
    paymentData: {
      amount: number;
      payment_date?: string;
    },
  ): Promise<any> {
    const result = await this.request<any>(
      `/umrah/without-transport/${id}/payment`,
      {
        method: "POST",
        body: JSON.stringify(paymentData),
      },
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to record payment");
  }

  async deleteUmrahWithoutTransport(id: string): Promise<void> {
    const result = await this.request<any>(`/umrah/without-transport/${id}`, {
      method: "DELETE",
    });

    if (!result.success) {
      throw new Error(
        result.message || "Failed to delete umrah without transport package",
      );
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
  async getUmrahGroupTickets(
    packageType?: string,
    search?: string,
  ): Promise<any> {
    const params = new URLSearchParams();
    if (packageType) params.append("package_type", packageType);
    if (search) params.append("search", search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const result = await this.request<any>(
      `/umrah/group-tickets${queryString}`,
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get group tickets");
  }

  async getUmrahGroupTicketsByDates(packageType: string): Promise<any> {
    const result = await this.request<any>(
      `/umrah/group-tickets/by-dates/${packageType}`,
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get grouped tickets by dates");
  }

  async getUmrahGroupTicketById(id: string): Promise<any> {
    const result = await this.request<any>(`/umrah/group-tickets/${id}`);

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get group ticket");
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
    const result = await this.request<any>("/umrah/group-tickets", {
      method: "POST",
      body: JSON.stringify(ticketData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to create group ticket");
  }

  async updateUmrahGroupTicket(id: string, ticketData: any): Promise<any> {
    const result = await this.request<any>(`/umrah/group-tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(ticketData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to update group ticket");
  }

  async deleteUmrahGroupTicket(
    id: string,
    force: boolean = false,
  ): Promise<void> {
    const url = force
      ? `/umrah/group-tickets/${id}?force=true`
      : `/umrah/group-tickets/${id}`;

    const result = await this.request<any>(url, {
      method: "DELETE",
    });

    if (!result.success) {
      // Include additional details for better error handling
      const error = new Error(
        result.message || "Failed to delete group ticket",
      );
      (error as any).canForceDelete = result.canForceDelete;
      (error as any).details = result.details;
      throw error;
    }
  }

  async getAvailableGroupTickets(
    packageType: "with-transport" | "without-transport",
    departureDate: string,
    returnDate: string,
  ): Promise<any> {
    const result = await this.request<any>(
      `/umrah/group-tickets/available/${packageType}/${departureDate}/${returnDate}`,
    );

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to get available group tickets");
  }

  async assignPassengerToGroup(assignmentData: {
    group_ticket_id: string;
    passenger_id: string;
    passenger_type: "with-transport" | "without-transport";
  }): Promise<any> {
    const result = await this.request<any>("/umrah/group-bookings", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });

    if (result.success && result.data) {
      return result.data;
    }
    throw new Error(result.message || "Failed to assign passenger to group");
  }

  async removePassengerFromGroup(assignmentId: string): Promise<void> {
    const result = await this.request<any>(
      `/umrah/group-bookings/${assignmentId}`,
      {
        method: "DELETE",
      },
    );

    if (!result.success) {
      throw new Error(
        result.message || "Failed to remove passenger from group",
      );
    }
  }
}

export const apiClient = new APIClient();
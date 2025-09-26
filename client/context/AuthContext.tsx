import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  username: string;
  role: "admin" | "manager" | "staff";
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isRole: (role: "admin" | "manager" | "staff") => boolean;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSIONS = {
  admin: [
    "view_buying_price",
    "edit_batches",
    "delete_batches",
    "create_batches",
    "view_profit",
    "override_locks",
    "manage_users",
    "view_all_bookings",
    "confirm_sales",
    "system_settings",
  ],
  manager: [
    "view_tickets",
    "create_bookings",
    "confirm_sales",
    "view_all_bookings",
  ],
  staff: ["view_tickets", "create_bookings", "partial_payments"],
};

const DEMO_USERS = {
  admin: {
    id: "1",
    username: "admin",
    role: "admin" as const,
    name: "Admin User",
    email: "admin@example.com",
    phone: "+1234567890",
    createdAt: new Date().toISOString(),
  },
  manager: {
    id: "2",
    username: "manager",
    role: "manager" as const,
    name: "Manager User",
    email: "manager@example.com",
    phone: "+1234567891",
    createdAt: new Date().toISOString(),
  },
  staff: {
    id: "3",
    username: "staff",
    role: "staff" as const,
    name: "Staff User",
    email: "staff@example.com",
    phone: "+1234567892",
    createdAt: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle HMR properly - only after initial mount
  useEffect(() => {
    const handleHMR = () => {
      if (import.meta.hot && import.meta.hot.data) {
        try {
          import.meta.hot.accept();
        } catch (error) {
          console.warn("HMR accept failed:", error);
        }
      }
    };

    // Delay HMR setup to ensure connection is ready
    const timer = setTimeout(handleHMR, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check for stored auth data
    const userData = localStorage.getItem("bd_ticket_pro_user");

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("bd_ticket_pro_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { 
    username: string; 
    password: string 
  }): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Demo login - accept any of the predefined users
    const demoUser = DEMO_USERS[credentials.username as keyof typeof DEMO_USERS];
    
    if (demoUser && credentials.password === `${credentials.username}123`) {
      setUser(demoUser);
      localStorage.setItem("bd_ticket_pro_user", JSON.stringify(demoUser));
      return true;
    }
    
    // Also accept the bypass login for any username with password "demo"
    if (credentials.password === "demo") {
      const user = {
        id: "demo-" + Date.now(),
        username: credentials.username,
        role: "admin" as const,
        name: `${credentials.username} (Demo)`,
        email: `${credentials.username}@demo.com`,
        createdAt: new Date().toISOString(),
      };
      setUser(user);
      localStorage.setItem("bd_ticket_pro_user", JSON.stringify(user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("bd_ticket_pro_user");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const isRole = (role: "admin" | "manager" | "staff"): boolean => {
    return user?.role === role;
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("bd_ticket_pro_user", JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isRole,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During HMR, context might be temporarily undefined
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

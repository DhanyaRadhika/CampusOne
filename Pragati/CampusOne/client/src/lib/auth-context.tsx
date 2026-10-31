import { createContext, useContext, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { User } from "./queryClient";

export type Role = "student" | "faculty" | "admin" | null;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (userData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    branch?: string;
    year?: number;
    skills?: string[];
    cgpa?: number;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Users
const MOCK_USERS: Record<string, User> = {
  student: {
    id: "s1",
    name: "Rama Krishna",
    role: "student",
    email: "alex.j@college.edu",
    branch: "Computer Science",
    year: 3,
    cgpa: 8.8,
    skills: ["React", "Node.js", "Python", "Data Structures"],
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces",
  },
  faculty: {
    id: "f1",
    name: "Priya",
    role: "faculty",
    email: "priya@gmail.com",
    department: "Computer Science",
    avatar:
      "https://images.unsplash.com/photo-1602442787305-decbd65be507?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  admin: {
    id: "a1",
    name: "Admin Office",
    role: "admin",
    email: "admin@college.edu",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=faces",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        // Redirect based on role
        if (userData.user.role === "student") setLocation("/student");
        else if (userData.user.role === "faculty") setLocation("/faculty");
        else if (userData.user.role === "admin") setLocation("/admin");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setLocation("/");
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    role: Role;
    branch?: string;
    year?: number;
    skills?: string[];
    cgpa?: number;
  }) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Account created successfully! Please login.");
        setLocation("/auth");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create account");
      }
    } catch (error: unknown) {
      console.error("Signup failed:", error);
      if (error instanceof Error) {
        alert(error.message || "Signup failed. Please try again.");
      } else if (typeof error === "string") {
        alert(error);
      } else {
        alert("Signup failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Password reset link sent to your email!");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to send reset link");
      }
    } catch (error) {
      console.error("Forgot password failed:", error);
      alert("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, signup, forgotPassword, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

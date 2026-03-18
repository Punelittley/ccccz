import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  readingBooks: string[]; // массив ID книг, которые читает пользователь
  role: "admin" | "user"; // роль пользователя
}

interface AuthContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<boolean>;
  register: (email: string, firstName: string, lastName: string, login: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: {
    email?: string;
    firstName?: string;
    lastName?: string;
    login?: string;
    oldPassword?: string;
    password?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  addBookToReading: (bookId: string) => Promise<void>;
  removeBookFromReading: (bookId: string) => Promise<void>;
  isBookInReading: (bookId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Загружаем токен и пользователя из localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("currentUser");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const register = async (email: string, firstName: string, lastName: string, login: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, lastName, login, password }),
      });
      if (!res.ok) {
        console.error(`Register failed with status ${res.status}`);
        return false;
      }
      const data = await res.json();
      return data.success;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      if (!res.ok) {
        console.error(`Login failed with status ${res.status}`);
        return false;
      }
      const data = await res.json();
      if (data.success && data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  const updateProfile = async (updates: {
    email?: string;
    firstName?: string;
    lastName?: string;
    login?: string;
    oldPassword?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "No user" };
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage");
        return { success: false, error: "No auth token" };
      }
      
      const userId = user.id.toString();
      console.log("Updating profile for user ID:", userId);
      console.log("Token:", token ? "Present" : "Missing");
      
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      
      let data: any;
      const contentType = res.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON response:", text);
        console.error("Response status:", res.status);
        return { success: false, error: "Unexpected server response" };
      }
      
      if (!res.ok) {
        console.error(`Update profile failed (${res.status}):`, data.error || data);
        return { success: false, error: data?.error || `Server returned ${res.status}` };
      }
      
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
        }

        return { success: true };
      }

      return { success: false, error: data?.error || "Unknown error" };
    } catch (e: any) {
      console.error("Update profile error:", e.message || e);
      return { success: false, error: e.message || "Network error" };
    }
  };

  const addBookToReading = async (bookId: string) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/users/${user.id}/reading/${bookId}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    // optimistic update
    if (!user.readingBooks.includes(bookId)) {
      const updatedUser = {
        ...user,
        readingBooks: [...user.readingBooks, bookId]
      };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  const removeBookFromReading = async (bookId: string) => {
    if (!user) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/users/${user.id}/reading/${bookId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const updatedUser = {
      ...user,
      readingBooks: user.readingBooks.filter(id => id !== bookId)
    };
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  const isBookInReading = (bookId: string): boolean => {
    return user?.readingBooks.includes(bookId) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, addBookToReading, removeBookFromReading, isBookInReading }}>
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

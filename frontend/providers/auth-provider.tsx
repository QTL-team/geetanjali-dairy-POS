"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({
            id: decoded.sub,
            email: decoded.email,
          });
        } else {
          Cookies.remove("token");
        }
      } catch (e) {
        console.error("Failed to parse token", e);
        Cookies.remove("token");
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      Cookies.set("token", token, { expires: 7 }); // 7 days
      setUser({
        id: decoded.sub,
        email: decoded.email,
      });
      router.push("/dashboard");
    } catch (e) {
      console.error("Invalid token on login", e);
    }
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


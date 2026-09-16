import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, AuthResponse } from '../types/auth';

// ── JWT expiry helper (H3 fix) ─────────────────────────────────────────────────

/**
 * Decode a JWT payload without verifying the signature (client-side only).
 * Returns null if the token is malformed or expired.
 */
function getTokenExpiry(token: string): number | null {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const payload = JSON.parse(atob(payloadB64));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const exp = getTokenExpiry(token);
  if (exp === null) return true; // malformed token — treat as expired
  return Date.now() / 1000 > exp;
}

// ── Context types ──────────────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  isDemo: boolean;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem('dynaprice:token');
    // If there's a stored token, validate it hasn't expired
    if (storedToken && isTokenExpired(storedToken)) {
      // Token is expired — clear storage immediately
      localStorage.removeItem('dynaprice:user');
      localStorage.removeItem('dynaprice:token');
      return null;
    }
    const storedUser = localStorage.getItem('dynaprice:user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('dynaprice:token');
    if (stored && isTokenExpired(stored)) return null;
    return stored;
  });

  const isDemo = user?.is_demo ?? false;

  // Periodically check token expiry while the tab is open
  useEffect(() => {
    if (!token) return;
    // Check every minute
    const interval = setInterval(() => {
      if (isTokenExpired(token)) {
        handleLogout();
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [token]);

  const handleLogin = (data: AuthResponse) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('dynaprice:user', JSON.stringify(data.user));
    localStorage.setItem('dynaprice:token', data.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dynaprice:user');
    localStorage.removeItem('dynaprice:token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isDemo, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

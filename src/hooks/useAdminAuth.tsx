import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'td_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      try {
        const { expiry, hash } = JSON.parse(session);
        if (expiry > Date.now() && hash) {
          setIsAdmin(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      // Validate password against edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Create session with hash (not the password itself)
        const sessionData = {
          expiry: Date.now() + SESSION_DURATION,
          hash: data.sessionToken,
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(sessionData));
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Admin auth error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

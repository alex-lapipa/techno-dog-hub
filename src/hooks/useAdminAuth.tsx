import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Admin Auth Context
 * 
 * This is now a wrapper around useAuth that provides backward compatibility.
 * Admin status is determined by checking the user_roles table for 'admin' role.
 * 
 * SECURITY: Never use localStorage or client-side checks for admin validation.
 * All admin checks are server-side validated through Supabase RLS policies.
 */

interface AdminAuthContextType {
  isAdmin: boolean;
  loading: boolean;
  logout: () => void;
  // User info from Supabase auth
  userId: string | null;
  userEmail: string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin, signOut } = useAuth();

  const logout = () => {
    signOut();
  };

  return (
    <AdminAuthContext.Provider 
      value={{ 
        isAdmin, 
        loading, 
        logout,
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
      }}
    >
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

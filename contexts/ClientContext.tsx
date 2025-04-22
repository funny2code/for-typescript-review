"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

import { Schema } from "amplify/data/resource";
import { generateClient } from "aws-amplify/api";

// Create the client
const client = generateClient<Schema>({
  authMode: "userPool",
});

// Create context for client
const ClientContext = createContext(client);

export const useClient = () => useContext(ClientContext);

// Provider component for client
export const ClientProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
};

// Define the shape of the authentication state
interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; name: string } | null;
  login: (user: { id: string; name: string }) => void;
  logout: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Custom hook to use the AuthContext
export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider component for authentication
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthState["user"]>(null);

  const login = (user: { id: string; name: string }) => {
    setUser(user);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthState = {
    isAuthenticated: !!user,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Example usage in a component
const UserProfile: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button
          onClick={() => login({ id: "1", name: "John Doe" })}
        >
          Login
        </button>
      )}
    </div>
  );
};

// Wrapping the application with providers
const App: React.FC = () => {
  return (
    <AuthProvider>
      <ClientProvider>
        <UserProfile />
      </ClientProvider>
    </AuthProvider>
  );
};

export default App;

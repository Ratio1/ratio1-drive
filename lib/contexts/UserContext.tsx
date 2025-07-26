'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  username: string | null;
  setUsername: (username: string) => void;
  isUserSet: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [isUserSet, setIsUserSet] = useState(false);

  useEffect(() => {
    // Load username from localStorage on mount
    const savedUsername = localStorage.getItem('ratio1-drive-username');
    if (savedUsername) {
      setUsernameState(savedUsername);
      setIsUserSet(true);
    }
  }, []);

  const setUsername = (newUsername: string) => {
    if (newUsername.trim()) {
      setUsernameState(newUsername.trim());
      setIsUserSet(true);
      localStorage.setItem('ratio1-drive-username', newUsername.trim());
    }
  };

  return (
    <UserContext.Provider value={{ username, setUsername, isUserSet }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 
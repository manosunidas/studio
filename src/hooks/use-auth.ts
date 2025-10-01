'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';

const USERS_STORAGE_KEY = 'manos-unidas-users';
const CURRENT_USER_STORAGE_KEY = 'manos-unidas-current-user';

export function useAuth() {
  const [users, setUsers] = useState<Record<string, { password: string; user: User }>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const storedCurrentUser = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }

      if (storedCurrentUser) {
        setCurrentUser(JSON.parse(storedCurrentUser));
      }
    } catch (error) {
      console.error("Failed to load auth data from local storage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const updateUsersStorage = (updatedUsers: Record<string, any>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const updateCurrentUserStorage = (user: User | null) => {
    if (user) {
        localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
        localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }

  const login = useCallback((email: string, password: string): User => {
    const storedUser = users[email.toLowerCase()];
    if (!storedUser || storedUser.password !== password) {
      throw new Error('Correo electrónico o contraseña incorrectos.');
    }
    setCurrentUser(storedUser.user);
    updateCurrentUserStorage(storedUser.user);
    return storedUser.user;
  }, [users]);

  const register = useCallback((fullName: string, email: string, password: string): User => {
    const lowerCaseEmail = email.toLowerCase();
    if (users[lowerCaseEmail]) {
      throw new Error('Ya existe una cuenta con este correo electrónico.');
    }
    const newUser: User = {
      name: fullName,
      email: lowerCaseEmail,
      memberSince: new Date().toISOString(),
    };
    const newUsers = { ...users, [lowerCaseEmail]: { password, user: newUser } };
    setUsers(newUsers);
    updateUsersStorage(newUsers);
    return newUser;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    updateCurrentUserStorage(null);
  }, []);

  return { user: currentUser, loading, login, register, logout };
}

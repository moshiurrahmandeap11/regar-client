'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem('token'));
  });

  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `token=${token}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
      return;
    }

    localStorage.removeItem('token');
    document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setAuthToken(token);
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setUser(res.data);
    }).catch(() => {
      setAuthToken(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password });
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, data);
    setAuthToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const token = localStorage.getItem('token');
    const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUser(res.data);
    return res.data;
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
    } catch (error) {
      console.error('Failed to refresh user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, refreshUser, loading, isAdmin: user?.isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

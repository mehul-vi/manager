// client/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data?.user || res.data);
        } catch (error) {
            // 401 is expected when not logged in — not a real error
            if (error.response?.status !== 401) {
                console.error('Auth check failed:', error.message);
            }
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        const loggedInUser = res.data?.user || res.data;
        setUser(loggedInUser);
        return loggedInUser;
    };

    const login = async (credentials) => {
        const res = await api.post('/auth/login', credentials);
        const loggedInUser = res.data?.user || res.data;
        setUser(loggedInUser);
        return loggedInUser;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setUser(null);
        }
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
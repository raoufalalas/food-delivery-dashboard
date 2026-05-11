import os

os.makedirs('src/config', exist_ok=True)
os.makedirs('src/context', exist_ok=True)
os.makedirs('src/pages', exist_ok=True)
os.makedirs('src/components', exist_ok=True)

# vite.config.js
open('vite.config.js','w').write("""import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
""")

# index.css
open('src/index.css','w').write("@import 'tailwindcss';\n")

# api.js
open('src/config/api.js','w').write("""import axios from 'axios';
const api = axios.create({
  baseURL: 'https://organic-fortnight-gjjx6xvwr69hvjv-5000.app.github.dev',
  headers: { 'Content-Type': 'application/json' }
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
export default api;
""")

# AuthContext.jsx
open('src/context/AuthContext.jsx','w').write("""import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
""")

# Login.jsx
open('src/pages/Login.jsx','w').write("""import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
export default function Login() {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('مرحبا ' + user.name);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'market') navigate('/market');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍕</div>
          <h1 className="text-2xl font-bold text-white">Food Delivery</h1>
          <p className="text-gray-400 mt-1">سجل دخولك للمتابعة</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm mb-1 block">البريد الالكتروني</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500"/>
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-1 block">كلمة المرور</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:border-orange-500"/>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition disabled:opacity-50">
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <div className="mt-4 p-4 bg-gray-700 rounded-xl text-xs text-gray-300 space-y-1">
          <p>Admin: admin@test.com / admin123</p>
          <p>Market: owner@test.com / 123456</p>
          <p>Customer: ali@test.com / 123456</p>
        </div>
      </div>
    </div>
  );
}
""")

# App.jsx
open('src/App.jsx','w').write("""import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">جاري التحميل...</div>;
  return user ? children : <Navigate to="/login" />;
};
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center"/>
        <Routes>
          <Route path="/login" element={<Login/>}/>
          <Route path="/" element={<ProtectedRoute><div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🍕</div><h1 className="text-3xl font-bold text-white">مرحبا بك</h1></div></div></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
""")

print('✅ All files created successfully')

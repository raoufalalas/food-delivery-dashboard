import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import CustomerHome from './pages/CustomerHome';
import MarketPage from './pages/MarketPage';
import MarketDashboard from './pages/MarketDashboard';
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
          <Route path="/market-dashboard" element={<ProtectedRoute><MarketDashboard/></ProtectedRoute>}/>
          <Route path="/market/:id" element={<ProtectedRoute><MarketPage/></ProtectedRoute>}/>
          <Route path="/customer" element={<ProtectedRoute><CustomerHome/></ProtectedRoute>}/>
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>}/>
          <Route path="/" element={<ProtectedRoute><AdminDashboard/></ProtectedRoute>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

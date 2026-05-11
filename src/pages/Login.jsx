import { useState } from 'react';
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
      else if (user.role === 'market') navigate('/market-dashboard');
      else if (user.role === 'customer') navigate('/customer');
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

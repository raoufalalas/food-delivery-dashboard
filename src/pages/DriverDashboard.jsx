import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [tab, setTab] = useState('available');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const a = await api.get('/api/orders/available');
      setAvailable(a.data.orders || []);
      // جيب طلبات الـ driver من endpoint مخصص
      try {
        const mine = await api.get('/api/orders/my-deliveries');
        setMyOrders(mine.data.orders || []);
      } catch { setMyOrders([]); }
    } catch { toast.error('خطأ في تحميل البيانات'); }
    finally { setLoading(false); }
  };

  const assignOrder = async (orderId) => {
    try {
      await api.patch('/api/orders/' + orderId + '/assign');
      toast.success('تم استلام الطلب بنجاح');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      await api.patch('/api/orders/' + orderId + '/status', { status: 'delivered' });
      toast.success('تم تسليم الطلب');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  const statusBadge = (status) => {
    const map = {
      on_the_way: ['#EEEDFE','#534AB7','في الطريق'],
      delivered:  ['#EAF3DE','#3B6D11','تم التسليم'],
      accepted:   ['#E6F1FB','#185FA5','مقبول'],
    };
    const [bg,color,label] = map[status] || ['#F1EFE8','#5F5E5A',status];
    return <span style={{background:bg,color,padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:500}}>{label}</span>;
  };

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-secondary)'}}>جاري التحميل...</div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--color-background-tertiary)',fontFamily:'var(--font-sans)'}} dir="rtl">

      <header style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,background:'#1D9E75',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🚗</div>
          <span style={{fontWeight:500,fontSize:15,color:'var(--color-text-primary)'}}>لوحة السائق</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:'var(--color-text-secondary)'}}>مرحباً، {user?.name}</span>
          <button onClick={loadData} style={{fontSize:13,padding:'6px 12px',background:'var(--color-background-secondary)',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer',color:'var(--color-text-primary)'}}>تحديث</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{fontSize:13,padding:'6px 14px',color:'var(--color-text-danger)',background:'var(--color-background-danger)',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer'}}>خروج</button>
        </div>
      </header>

      <div style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',gap:4}}>
        {[['available','الطلبات المتاحة'],['myorders','طلباتي']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{padding:'12px 16px',fontSize:14,background:'none',border:'none',borderBottom:tab===key?'2px solid #1D9E75':'2px solid transparent',color:tab===key?'var(--color-text-primary)':'var(--color-text-secondary)',fontWeight:tab===key?500:400,cursor:'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6}}>
            {label}
            {key==='available' && available.length > 0 && <span style={{background:'#1D9E75',color:'white',borderRadius:10,fontSize:11,padding:'1px 6px'}}>{available.length}</span>}
          </button>
        ))}
      </div>

      <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>

        {tab === 'available' && (
          <div>
            <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>الطلبات المتاحة ({available.length})</h2>
            {available.length === 0 ? (
              <div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-secondary)'}}>
                <div style={{fontSize:48,marginBottom:12}}>🕐</div>
                <p style={{fontSize:14}}>لا توجد طلبات متاحة الآن</p>
                <p style={{fontSize:12,marginTop:8}}>اضغط تحديث للتحقق من طلبات جديدة</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {available.map(o => (
                  <div key={o.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)',marginBottom:4}}>
                          🏪 {o.Market?.name || 'مطعم'}
                        </div>
                        <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:4}}>
                          📍 {o.deliveryAddress}
                        </div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--color-text-tertiary)'}}>
                          #{o.id?.slice(0,8)}
                        </div>
                      </div>
                      <div style={{textAlign:'left'}}>
                        <div style={{fontSize:18,fontWeight:600,color:'#1D9E75',marginBottom:8}}>{parseFloat(o.totalPrice||0).toFixed(2)} ج.م</div>
                        <button onClick={() => assignOrder(o.id)} style={{padding:'8px 20px',background:'#1D9E75',color:'white',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                          🚗 استلم الطلب
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'myorders' && (
          <div>
            <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>طلباتي ({myOrders.length})</h2>
            {myOrders.length === 0 ? (
              <div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-secondary)'}}>
                <div style={{fontSize:48,marginBottom:12}}>📦</div>
                <p style={{fontSize:14}}>لم تستلم أي طلبات بعد</p>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {myOrders.map(o => (
                  <div key={o.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)',marginBottom:4}}>
                          🏪 {o.Market?.name || 'مطعم'}
                        </div>
                        <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:4}}>
                          👤 {o.customer?.name || 'عميل'}
                        </div>
                        <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:4}}>
                          📍 {o.deliveryAddress}
                        </div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--color-text-tertiary)'}}>
                          #{o.id?.slice(0,8)}
                        </div>
                      </div>
                      <div style={{textAlign:'left'}}>
                        {statusBadge(o.status)}
                        <div style={{fontSize:16,fontWeight:600,color:'var(--color-text-primary)',marginTop:8}}>{parseFloat(o.totalPrice||0).toFixed(2)} ج.م</div>
                      </div>
                    </div>
                    {o.status === 'on_the_way' && (
                      <div style={{borderTop:'0.5px solid var(--color-border-tertiary)',paddingTop:12,display:'flex',justifyContent:'flex-end'}}>
                        <button onClick={() => deliverOrder(o.id)} style={{padding:'8px 20px',background:'#1D9E75',color:'white',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                          ✅ تم التسليم
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

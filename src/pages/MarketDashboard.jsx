import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending:    { label:'معلق',        bg:'#FAEEDA', color:'#854F0B', next:'accepted',   nextLabel:'قبول' },
  accepted:   { label:'مقبول',       bg:'#E6F1FB', color:'#185FA5', next:'preparing',  nextLabel:'بدء التحضير' },
  preparing:  { label:'يُحضَّر',     bg:'#E1F5EE', color:'#0F6E56', next:null,         nextLabel:null },
  on_the_way: { label:'في الطريق',   bg:'#EEEDFE', color:'#534AB7', next:null,         nextLabel:null },
  delivered:  { label:'تم التسليم',  bg:'#EAF3DE', color:'#3B6D11', next:null,         nextLabel:null },
  cancelled:  { label:'ملغي',        bg:'#FCEBEB', color:'#A32D2D', next:null,         nextLabel:null },
};

export default function MarketDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/market');
      setOrders(res.data.orders || []);
    } catch { toast.error('خطأ في تحميل الطلبات'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch('/api/orders/' + orderId + '/status', { status });
      toast.success('تم تحديث حالة الطلب');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await api.patch('/api/orders/' + orderId + '/status', { status: 'cancelled' });
      toast.success('تم إلغاء الطلب');
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ');
    }
  };

  const tabs = [
    { key:'all',       label:'الكل' },
    { key:'pending',   label:'معلق' },
    { key:'accepted',  label:'مقبول' },
    { key:'preparing', label:'يُحضَّر' },
    { key:'delivered', label:'تم التسليم' },
  ];

  const filtered = tab === 'all' ? orders : orders.filter(o => o.status === tab);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-secondary)'}}>جاري التحميل...</div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--color-background-tertiary)',fontFamily:'var(--font-sans)'}} dir="rtl">

      <header style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,background:'#E24B4A',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🏪</div>
          <span style={{fontWeight:500,fontSize:15,color:'var(--color-text-primary)'}}>لوحة المطعم</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:'var(--color-text-secondary)'}}>مرحباً، {user?.name}</span>
          <button onClick={loadOrders} style={{fontSize:13,padding:'6px 12px',background:'var(--color-background-secondary)',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer',color:'var(--color-text-primary)'}}>تحديث</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{fontSize:13,padding:'6px 14px',color:'var(--color-text-danger)',background:'var(--color-background-danger)',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer'}}>خروج</button>
        </div>
      </header>

      <div style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',gap:4}}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{padding:'12px 16px',fontSize:14,background:'none',border:'none',borderBottom:tab===t.key?'2px solid #E24B4A':'2px solid transparent',color:tab===t.key?'var(--color-text-primary)':'var(--color-text-secondary)',fontWeight:tab===t.key?500:400,cursor:'pointer',transition:'all 0.15s',display:'flex',alignItems:'center',gap:6}}>
            {t.label}
            {t.key==='pending' && pendingCount > 0 && <span style={{background:'#E24B4A',color:'white',borderRadius:10,fontSize:11,padding:'1px 6px'}}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',margin:0}}>
            {tab==='all'?'جميع الطلبات':tabs.find(t=>t.key===tab)?.label} ({filtered.length})
          </h2>
          {pendingCount > 0 && tab !== 'pending' && (
            <div style={{background:'#FAEEDA',color:'#854F0B',padding:'6px 14px',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:500}}>
              ⚠️ {pendingCount} طلب بانتظار موافقتك
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{textAlign:'center',padding:'64px 0',color:'var(--color-text-secondary)'}}>
            <div style={{fontSize:48,marginBottom:12}}>📭</div>
            <p style={{fontSize:14}}>لا توجد طلبات</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(o => {
              const s = STATUS_MAP[o.status] || {};
              return (
                <div key={o.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                        <span style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)'}}>{o.customer?.name || 'عميل'}</span>
                        <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--color-text-tertiary)'}}>#{o.id?.slice(0,8)}</span>
                      </div>
                      <div style={{fontSize:13,color:'var(--color-text-secondary)'}}>📍 {o.deliveryAddress}</div>
                      {o.notes && <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:4}}>📝 {o.notes}</div>}
                    </div>
                    <span style={{background:s.bg,color:s.color,padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:500,flexShrink:0}}>{s.label}</span>
                  </div>

                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:12,borderTop:'0.5px solid var(--color-border-tertiary)'}}>
                    <span style={{fontSize:15,fontWeight:600,color:'var(--color-text-primary)'}}>{parseFloat(o.totalPrice||0).toFixed(2)} ج.م</span>
                    <div style={{display:'flex',gap:8}}>
                      {o.status !== 'cancelled' && o.status !== 'delivered' && o.status !== 'on_the_way' && (
                        <button onClick={() => cancelOrder(o.id)} style={{fontSize:13,padding:'6px 14px',background:'#FCEBEB',color:'#A32D2D',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer',fontWeight:500}}>إلغاء</button>
                      )}
                      {s.next && (
                        <button onClick={() => updateStatus(o.id, s.next)} style={{fontSize:13,padding:'6px 14px',background:'#E24B4A',color:'white',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer',fontWeight:500}}>{s.nextLabel}</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function CustomerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [tab, setTab] = useState('markets');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [m, o] = await Promise.all([
        api.get('/api/markets'),
        api.get('/api/orders/my'),
      ]);
      setMarkets(m.data.markets || []);
      setMyOrders(o.data.orders || []);
    } catch { toast.error('خطأ في تحميل البيانات'); }
    finally { setLoading(false); }
  };

  const statusBadge = (status) => {
    const map = {
      pending:['#FAEEDA','#854F0B','معلق'],
      accepted:['#E6F1FB','#185FA5','مقبول'],
      preparing:['#E1F5EE','#0F6E56','يحضر'],
      on_the_way:['#EEEDFE','#534AB7','في الطريق'],
      delivered:['#EAF3DE','#3B6D11','تم التسليم'],
      cancelled:['#FCEBEB','#A32D2D','ملغي'],
    };
    const [bg,color,label] = map[status] || ['#F1EFE8','#5F5E5A',status];
    return <span style={{background:bg,color,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>{label}</span>;
  };

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-secondary)'}}>جاري التحميل...</div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--color-background-tertiary)',fontFamily:'var(--font-sans)'}} dir="rtl">
      <header style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,background:'#E24B4A',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🍕</div>
          <span style={{fontWeight:500,fontSize:15,color:'var(--color-text-primary)'}}>Food Delivery</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <span style={{fontSize:13,color:'var(--color-text-secondary)'}}>مرحباً، {user?.name}</span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{fontSize:13,padding:'6px 14px',color:'var(--color-text-danger)',background:'var(--color-background-danger)',border:'none',borderRadius:'var(--border-radius-md)',cursor:'pointer'}}>خروج</button>
        </div>
      </header>

      <div style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',gap:4}}>
        {[['markets','المطاعم'],['orders','طلباتي']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)} style={{padding:'12px 16px',fontSize:14,background:'none',border:'none',borderBottom:tab===key?'2px solid #E24B4A':'2px solid transparent',color:tab===key?'var(--color-text-primary)':'var(--color-text-secondary)',fontWeight:tab===key?500:400,cursor:'pointer',transition:'all 0.15s'}}>
            {label}{key==='orders'&&myOrders.length>0&&<span style={{background:'#E24B4A',color:'white',borderRadius:10,fontSize:11,padding:'1px 6px',marginRight:4}}>{myOrders.length}</span>}
          </button>
        ))}
      </div>

      <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        {tab === 'markets' && (
          <div>
            <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>المطاعم المتاحة</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
              {markets.length === 0 && <p style={{color:'var(--color-text-secondary)',fontSize:14}}>لا توجد مطاعم</p>}
              {markets.map(m => (
                <div key={m.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem',cursor:'pointer',transition:'border-color 0.15s'}}
                  onMouseOver={e=>e.currentTarget.style.borderColor='var(--color-border-secondary)'}
                  onMouseOut={e=>e.currentTarget.style.borderColor='var(--color-border-tertiary)'}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{width:44,height:44,background:'#FAEEDA',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🏪</div>
                    <span style={{background:m.isOpen?'#EAF3DE':'#FCEBEB',color:m.isOpen?'#3B6D11':'#A32D2D',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>{m.isOpen?'مفتوح':'مغلق'}</span>
                  </div>
                  <div style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)',marginBottom:4}}>{m.name}</div>
                  <div style={{fontSize:13,color:'var(--color-text-secondary)',marginBottom:12}}>{m.address}</div>
                  <button onClick={() => navigate('/market/'+m.id)} disabled={!m.isOpen} style={{width:'100%',padding:'8px',background:m.isOpen?'#E24B4A':'var(--color-background-secondary)',color:m.isOpen?'white':'var(--color-text-secondary)',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:500,cursor:m.isOpen?'pointer':'not-allowed'}}>
                    {m.isOpen?'اطلب الآن':'مغلق حالياً'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>طلباتي ({myOrders.length})</h2>
            {myOrders.length === 0 ? (
              <div style={{textAlign:'center',padding:'48px 0',color:'var(--color-text-secondary)'}}>
                <div style={{fontSize:48,marginBottom:12}}>📦</div>
                <p style={{fontSize:14}}>لا توجد طلبات بعد</p>
                <button onClick={()=>setTab('markets')} style={{marginTop:12,padding:'8px 20px',background:'#E24B4A',color:'white',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,cursor:'pointer'}}>اطلب الآن</button>
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {myOrders.map(o => (
                  <div key={o.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                      <div>
                        <div style={{fontSize:14,fontWeight:500,color:'var(--color-text-primary)'}}>{o.Market?.name||'مطعم'}</div>
                        <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:2,fontFamily:'var(--font-mono)'}}>{o.id?.slice(0,8)}...</div>
                      </div>
                      {statusBadge(o.status)}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--color-text-secondary)'}}>
                      <span>📍 {o.deliveryAddress}</span>
                      <span style={{fontWeight:500,color:'var(--color-text-primary)'}}>{parseFloat(o.totalPrice||0).toFixed(2)} ج.م</span>
                    </div>
                    {o.notes&&<div style={{marginTop:8,fontSize:12,color:'var(--color-text-secondary)',background:'var(--color-background-secondary)',padding:'6px 10px',borderRadius:'var(--border-radius-md)'}}>ملاحظة: {o.notes}</div>}
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

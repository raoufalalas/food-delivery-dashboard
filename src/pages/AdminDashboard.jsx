
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const TABS = [
  { id:'overview', label:'نظرة عامة', icon:'layout-dashboard' },
  { id:'users',    label:'المستخدمين', icon:'users' },
  { id:'orders',   label:'الطلبات',    icon:'shopping-bag' },
  { id:'markets',  label:'المطاعم',    icon:'building-store' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [markets, setMarkets] = useState([]);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [s, u, o, m] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/orders'),
        api.get('/api/admin/markets/report'),
      ]);
      setStats(s.data);
      setUsers(u.data.users);
      setOrders(o.data.orders);
      setMarkets(m.data.markets);
    } catch { toast.error('خطأ في تحميل البيانات'); }
  };

  const toggleUser = async (id) => {
    try {
      await api.patch('/api/admin/users/' + id + '/toggle');
      toast.success('تم تغيير الحالة');
      const res = await api.get('/api/admin/users');
      setUsers(res.data.users);
    } catch { toast.error('خطأ'); }
  };

  const roleBadge = (role) => {
    const map = { admin:['#FCEBEB','#A32D2D','أدمن'], market:['#E6F1FB','#185FA5','مطعم'], driver:['#EAF3DE','#3B6D11','سائق'], customer:['#F1EFE8','#5F5E5A','عميل'] };
    const [bg, color, label] = map[role] || map.customer;
    return <span style={{background:bg,color,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>{label}</span>;
  };

  const statusBadge = (status) => {
    const map = { pending:['#FAEEDA','#854F0B','معلق'], accepted:['#E6F1FB','#185FA5','مقبول'], preparing:['#E1F5EE','#0F6E56','يُحضَّر'], on_the_way:['#EEEDFE','#534AB7','في الطريق'], delivered:['#EAF3DE','#3B6D11','تم التسليم'], cancelled:['#FCEBEB','#A32D2D','ملغي'] };
    const [bg, color, label] = map[status] || ['#F1EFE8','#5F5E5A', status];
    return <span style={{background:bg,color,padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>{label}</span>;
  };

  const initials = (name='') => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const avatarColors = [['#E6F1FB','#185FA5'],['#EAF3DE','#3B6D11'],['#FAEEDA','#854F0B'],['#EEEDFE','#534AB7'],['#FCEBEB','#A32D2D']];
  const avatar = (name, i=0) => { const [bg,color]=avatarColors[i%5]; return {bg,color}; };

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--color-background-tertiary)',fontFamily:'var(--font-sans)'}} dir="rtl">

      {/* Sidebar */}
      <div style={{width:220,background:'var(--color-background-primary)',borderLeft:'0.5px solid var(--color-border-tertiary)',display:'flex',flexDirection:'column',position:'fixed',top:0,right:0,height:'100vh',zIndex:10}}>
        <div style={{padding:'20px 16px',borderBottom:'0.5px solid var(--color-border-tertiary)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,background:'#E24B4A',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'white',fontSize:16}}>🍕</span>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:500,color:'var(--color-text-primary)'}}>Food Delivery</div>
            <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>لوحة الإدارة</div>
          </div>
        </div>

        <nav style={{flex:1,padding:'12px 0',overflowY:'auto'}}>
          <div style={{padding:'6px 16px 4px',fontSize:11,color:'var(--color-text-tertiary)',letterSpacing:'0.5px',textTransform:'uppercase'}}>القائمة</div>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',fontSize:14,color:tab===t.id?'var(--color-text-primary)':'var(--color-text-secondary)',background:tab===t.id?'var(--color-background-secondary)':'transparent',borderRadius:'var(--border-radius-md)',margin:'2px 8px',cursor:'pointer',fontWeight:tab===t.id?500:400,transition:'all 0.15s'}}>
              <i className={'ti ti-'+t.icon} style={{fontSize:18}} aria-hidden="true"></i>
              {t.label}
            </div>
          ))}
        </nav>

        <div style={{padding:'12px 8px',borderTop:'0.5px solid var(--color-border-tertiary)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px',borderRadius:'var(--border-radius-md)'}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'#E6F1FB',color:'#185FA5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,flexShrink:0}}>{initials(user?.name)}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:'var(--color-text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
              <div style={{fontSize:11,color:'var(--color-text-secondary)'}}>admin</div>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',padding:4}}>
              <i className="ti ti-logout" style={{fontSize:16}} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{marginRight:220,flex:1,padding:24,overflowY:'auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:500,color:'var(--color-text-primary)'}}>{TABS.find(t=>t.id===tab)?.label}</h1>
            <p style={{fontSize:13,color:'var(--color-text-secondary)',marginTop:2}}>{new Date().toLocaleDateString('ar-EG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <button onClick={loadAll} style={{display:'flex',alignItems:'center',gap:6,fontSize:13,padding:'8px 14px'}}>
            <i className="ti ti-refresh" style={{fontSize:15}} aria-hidden="true"></i> تحديث
          </button>
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && stats && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12,marginBottom:20}}>
              {[
                {label:'المستخدمين',value:stats.users?.total,icon:'users',bg:'#E6F1FB',color:'#185FA5'},
                {label:'الطلبات',value:stats.orders?.total,icon:'shopping-bag',bg:'#EAF3DE',color:'#3B6D11'},
                {label:'المطاعم',value:stats.markets?.total,icon:'building-store',bg:'#FAEEDA',color:'#854F0B'},
                {label:'الإيرادات',value:(stats.revenue?.total||0)+' ج.م',icon:'currency-pound',bg:'#E1F5EE',color:'#0F6E56'},
              ].map(c => (
                <div key={c.label} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div>
                      <div style={{fontSize:12,color:'var(--color-text-secondary)',marginBottom:8}}>{c.label}</div>
                      <div style={{fontSize:26,fontWeight:500,color:'var(--color-text-primary)'}}>{c.value}</div>
                    </div>
                    <div style={{background:c.bg,width:38,height:38,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <i className={'ti ti-'+c.icon} style={{fontSize:18,color:c.color}} aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:16}}>
              <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:16,color:'var(--color-text-primary)'}}>توزيع الطلبات</div>
                {[
                  {label:'تم التسليم',value:stats.orders?.delivered,total:stats.orders?.total,color:'#1D9E75'},
                  {label:'معلق',value:stats.orders?.pending,total:stats.orders?.total,color:'#EF9F27'},
                  {label:'ملغي',value:stats.orders?.cancelled,total:stats.orders?.total,color:'#E24B4A'},
                ].map(item => (
                  <div key={item.label} style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
                      <span style={{color:'var(--color-text-secondary)'}}>{item.label}</span>
                      <span style={{fontWeight:500,color:'var(--color-text-primary)'}}>{item.value}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:'var(--color-background-secondary)'}}>
                      <div style={{height:'100%',borderRadius:3,background:item.color,width:(item.total?Math.round((item.value/item.total)*100):0)+'%',transition:'width 0.3s'}}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                <div style={{fontSize:14,fontWeight:500,marginBottom:16,color:'var(--color-text-primary)'}}>المستخدمين حسب الدور</div>
                {[
                  {label:'أدمن',value:1,color:'#E24B4A'},
                  {label:'مطعم',value:1,color:'#378ADD'},
                  {label:'سائق',value:1,color:'#1D9E75'},
                  {label:'عميل',value:stats.users?.customers-1||1,color:'#888780'},
                ].map(r => (
                  <div key={r.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:r.color}}></div>
                      <span style={{fontSize:13,color:'var(--color-text-secondary)'}}>{r.label}</span>
                    </div>
                    <span style={{fontSize:13,fontWeight:500,color:'var(--color-text-primary)'}}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',overflow:'hidden'}}>
            <div style={{padding:16,borderBottom:'0.5px solid var(--color-border-tertiary)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:14,fontWeight:500,color:'var(--color-text-primary)'}}>جميع المستخدمين ({users.length})</span>
            </div>
            <table style={{width:'100%',fontSize:13,borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'var(--color-background-secondary)'}}>
                  {['المستخدم','الإيميل','الدور','الحالة','إجراء'].map(h => <th key={h} style={{textAlign:'right',padding:'10px 16px',fontSize:12,color:'var(--color-text-secondary)',fontWeight:500}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.map((u,i) => (
                  <tr key={u.id} style={{borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:avatarColors[i%5][0],color:avatarColors[i%5][1],display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:500,flexShrink:0}}>{initials(u.name)}</div>
                        <span style={{fontWeight:500,color:'var(--color-text-primary)'}}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{padding:'12px 16px',color:'var(--color-text-secondary)'}}>{u.email}</td>
                    <td style={{padding:'12px 16px'}}>{roleBadge(u.role)}</td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{background:u.isActive!==false?'#EAF3DE':'#FCEBEB',color:u.isActive!==false?'#3B6D11':'#A32D2D',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500}}>
                        {u.isActive!==false?'نشط':'معطل'}
                      </span>
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleUser(u.id)} style={{fontSize:12,padding:'4px 12px',background:u.isActive!==false?'var(--color-background-danger)':'var(--color-background-success)',color:u.isActive!==false?'var(--color-text-danger)':'var(--color-text-success)',border:'none',borderRadius:6,cursor:'pointer'}}>
                          {u.isActive!==false?'تعطيل':'تفعيل'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',overflow:'hidden'}}>
            <div style={{padding:16,borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
              <span style={{fontSize:14,fontWeight:500,color:'var(--color-text-primary)'}}>جميع الطلبات ({orders.length})</span>
            </div>
            <table style={{width:'100%',fontSize:13,borderCollapse:'collapse',tableLayout:'fixed'}}>
              <thead>
                <tr style={{background:'var(--color-background-secondary)'}}>
                  {['رقم الطلب','العميل','العنوان','المطعم','المبلغ','الحالة'].map(h => <th key={h} style={{textAlign:'right',padding:'10px 16px',fontSize:12,color:'var(--color-text-secondary)',fontWeight:500}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
                    <td style={{padding:'12px 16px',fontFamily:'var(--font-mono)',fontSize:12,color:'var(--color-text-secondary)'}}>{o.id?.slice(0,8)}...</td>
                    <td style={{padding:'12px 16px',color:'var(--color-text-primary)'}}>{o.customer?.name || '—'}</td>
                    <td style={{padding:'12px 16px',color:'var(--color-text-secondary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.deliveryAddress}</td>
                    <td style={{padding:'12px 16px',color:'var(--color-text-secondary)'}}>{o.Market?.name || '—'}</td>
                    <td style={{padding:'12px 16px',fontWeight:500,color:'var(--color-text-primary)'}}>{parseFloat(o.totalPrice||0).toFixed(2)} ج.م</td>
                    <td style={{padding:'12px 16px'}}>{statusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MARKETS */}
        {tab === 'markets' && (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {markets.map(m => (
              <div key={m.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:48,height:48,background:'#FAEEDA',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <i className="ti ti-building-store" style={{fontSize:22,color:'#854F0B'}} aria-hidden="true"></i>
                    </div>
                    <div>
                      <div style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)'}}>{m.name}</div>
                      <div style={{fontSize:13,color:'var(--color-text-secondary)'}}>{m.address}</div>
                    </div>
                  </div>
                  <span style={{background:m.isOpen?'#EAF3DE':'#FCEBEB',color:m.isOpen?'#3B6D11':'#A32D2D',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:500}}>
                    {m.isOpen?'مفتوح':'مغلق'}
                  </span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                  {[
                    {label:'إجمالي الطلبات',value:m.stats?.totalOrders},
                    {label:'تم التسليم',value:m.stats?.deliveredOrders},
                    {label:'الإيرادات',value:parseFloat(m.stats?.revenue||0).toFixed(2)+' ج.م'},
                  ].map(s => (
                    <div key={s.label} style={{textAlign:'center',padding:12,background:'var(--color-background-secondary)',borderRadius:'var(--border-radius-md)'}}>
                      <div style={{fontSize:20,fontWeight:500,color:'var(--color-text-primary)'}}>{s.value}</div>
                      <div style={{fontSize:12,color:'var(--color-text-secondary)',marginTop:4}}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

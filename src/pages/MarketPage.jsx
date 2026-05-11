import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

export default function MarketPage() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [m, p] = await Promise.all([
        api.get('/api/markets/' + id),
        api.get('/api/products/' + id + '/products'),
      ]);
      setMarket(m.data.market);
      setProducts(p.data.products || []);
    } catch { toast.error('خطأ في تحميل بيانات المطعم'); }
    finally { setLoading(false); }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.productId === product.id);
      if (exists) return prev.map(i => i.productId === product.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { productId: product.id, name: product.name, price: parseFloat(product.price), quantity: 1 }];
    });
    toast.success(product.name + ' اتضاف للسلة');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const placeOrder = async () => {
    if (!address.trim()) { toast.error('ادخل عنوان التوصيل'); return; }
    if (cart.length === 0) { toast.error('السلة فارغة'); return; }
    setOrdering(true);
    try {
      await api.post('/api/orders', {
        marketId: id,
        deliveryAddress: address,
        notes,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
      });
      toast.success('تم تقديم الطلب بنجاح');
      setCart([]);
      setShowCart(false);
      navigate('/customer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تقديم الطلب');
    } finally { setOrdering(false); }
  };

  if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--color-text-secondary)'}}>جاري التحميل...</div>;

  return (
    <div style={{minHeight:'100vh',background:'var(--color-background-tertiary)',fontFamily:'var(--font-sans)'}} dir="rtl">
      <header style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:56}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={() => navigate('/customer')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--color-text-secondary)',fontSize:20,padding:4}}>←</button>
          <span style={{fontWeight:500,fontSize:15,color:'var(--color-text-primary)'}}>{market?.name}</span>
        </div>
        <button onClick={() => setShowCart(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',background:'#E24B4A',color:'white',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:500,cursor:'pointer'}}>
          🛒 السلة
          {cart.length > 0 && <span style={{background:'white',color:'#E24B4A',borderRadius:10,fontSize:11,padding:'1px 6px',fontWeight:700}}>{cart.reduce((s,i)=>s+i.quantity,0)}</span>}
        </button>
      </header>

      <div style={{background:'var(--color-background-primary)',borderBottom:'0.5px solid var(--color-border-tertiary)',padding:'16px 24px'}}>
        <p style={{fontSize:13,color:'var(--color-text-secondary)',margin:0}}>📍 {market?.address}</p>
        <span style={{background:market?.isOpen?'#EAF3DE':'#FCEBEB',color:market?.isOpen?'#3B6D11':'#A32D2D',padding:'3px 10px',borderRadius:20,fontSize:12,fontWeight:500,marginTop:8,display:'inline-block'}}>{market?.isOpen?'مفتوح':'مغلق'}</span>
      </div>

      <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        <h2 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>المنتجات ({products.length})</h2>
        {products.length === 0 && <p style={{color:'var(--color-text-secondary)',fontSize:14,textAlign:'center',padding:'48px 0'}}>لا توجد منتجات متاحة</p>}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
          {products.map(p => (
            <div key={p.id} style={{background:'var(--color-background-primary)',border:'0.5px solid var(--color-border-tertiary)',borderRadius:'var(--border-radius-lg)',padding:'1.25rem'}}>
              <div style={{width:'100%',height:120,background:'#FAEEDA',borderRadius:'var(--border-radius-md)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,marginBottom:12}}>🍽️</div>
              <div style={{fontSize:15,fontWeight:500,color:'var(--color-text-primary)',marginBottom:4}}>{p.name}</div>
              {p.description && <div style={{fontSize:12,color:'var(--color-text-secondary)',marginBottom:8}}>{p.description}</div>}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
                <span style={{fontSize:16,fontWeight:600,color:'#E24B4A'}}>{parseFloat(p.price).toFixed(2)} ج.م</span>
                <button onClick={() => addToCart(p)} disabled={!market?.isOpen} style={{padding:'7px 16px',background:market?.isOpen?'#E24B4A':'var(--color-background-secondary)',color:market?.isOpen?'white':'var(--color-text-secondary)',border:'none',borderRadius:'var(--border-radius-md)',fontSize:13,fontWeight:500,cursor:market?.isOpen?'pointer':'not-allowed'}}>
                  أضف +
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCart && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={() => setShowCart(false)}>
          <div style={{background:'var(--color-background-primary)',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:600,padding:24,maxHeight:'80vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <h3 style={{fontSize:16,fontWeight:500,color:'var(--color-text-primary)',marginBottom:16}}>🛒 السلة</h3>
            {cart.length === 0 ? (
              <p style={{textAlign:'center',color:'var(--color-text-secondary)',padding:'24px 0'}}>السلة فارغة</p>
            ) : (
              <>
                {cart.map(i => (
                  <div key={i.productId} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'0.5px solid var(--color-border-tertiary)'}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:500,color:'var(--color-text-primary)'}}>{i.name}</div>
                      <div style={{fontSize:12,color:'var(--color-text-secondary)'}}>{i.price} ج.م × {i.quantity} = {(i.price*i.quantity).toFixed(2)} ج.م</div>
                    </div>
                    <button onClick={() => removeFromCart(i.productId)} style={{background:'#FCEBEB',color:'#A32D2D',border:'none',borderRadius:6,padding:'4px 10px',cursor:'pointer',fontSize:12}}>حذف</button>
                  </div>
                ))}
                <div style={{marginTop:16}}>
                  <div style={{fontSize:16,fontWeight:600,color:'var(--color-text-primary)',marginBottom:16}}>الإجمالي: {totalPrice.toFixed(2)} ج.م</div>
                  <div style={{marginBottom:12}}>
                    <label style={{fontSize:13,color:'var(--color-text-secondary)',display:'block',marginBottom:4}}>عنوان التوصيل *</label>
                    <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="ادخل عنوانك" style={{width:'100%',padding:'10px 12px',border:'1px solid #ccc',borderRadius:8,fontSize:14,background:'white',color:'black',boxSizing:'border-box',display:'block'}}/>
                  </div>
                  <div style={{marginBottom:16}}>
                    <label style={{fontSize:13,color:'var(--color-text-secondary)',display:'block',marginBottom:4}}>ملاحظات (اختياري)</label>
                    <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="بدون بصل مثلاً..." style={{width:'100%',padding:'10px 12px',border:'1px solid #ccc',borderRadius:8,fontSize:14,background:'white',color:'black',boxSizing:'border-box',display:'block'}}/>
                  </div>
                  <button onClick={placeOrder} disabled={ordering} style={{width:'100%',padding:'12px',background:'#E24B4A',color:'white',border:'none',borderRadius:'var(--border-radius-md)',fontSize:15,fontWeight:600,cursor:'pointer',opacity:ordering?0.7:1}}>
                    {ordering ? 'جاري تقديم الطلب...' : 'تقديم الطلب'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Search, Filter, Globe, MessageCircle, Store, Phone, 
  Clock, Eye, Pencil, Printer, MoreVertical, CheckCircle, ChefHat, Truck, 
  Banknote, CreditCard, Smartphone, X, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminPedidos() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // POS State
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [posSearch, setPosSearch] = useState('');
  const [newOrderCart, setNewOrderCart] = useState([]);
  const [newOrderCustomer, setNewOrderCustomer] = useState({
    name: 'Cliente Local', phone: '0000000000', address: '', deliveryType: 'presencial', paymentMethod: 'efectivo', source: 'Presencial'
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'ok') setProducts(data.products.filter(p => p.status === 'Activo'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const token = localStorage.getItem('distrito_admin_token');
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) return;
    const token = localStorage.getItem('distrito_admin_token');
    try {
      await fetch(`${API_URL}/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintOrder = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    let itemsHtml = '';
    if (order.cart_json) {
      order.cart_json.forEach(item => {
        itemsHtml += `<div style="display:flex; justify-content:space-between; margin-bottom:5px;">
          <span>${item.quantity}x ${item.title}</span>
          <span>$${(item.price * item.quantity).toLocaleString()}</span>
        </div>`;
      });
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir Pedido #${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 14px; padding: 20px; color: #000; }
            h2 { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 16px; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h2>DISTRITO BG</h2>
          <div class="row"><span>Pedido:</span><span>#${order.id.toString().padStart(4, '0')}</span></div>
          <div class="row"><span>Fecha:</span><span>${new Date(order.created_at).toLocaleString()}</span></div>
          <div class="row"><span>Cliente:</span><span>${order.customer_name}</span></div>
          <div class="row"><span>Teléfono:</span><span>${order.customer_phone}</span></div>
          <div class="row"><span>Entrega:</span><span>${order.delivery_type}</span></div>
          <div class="row"><span>Método Pago:</span><span>${order.payment_method}</span></div>
          <br>
          <div style="border-bottom: 1px dashed #000; margin-bottom:10px;"><b>Productos</b></div>
          ${itemsHtml}
          <div class="row total"><span>TOTAL</span><span>$${(order.total || 0).toLocaleString()}</span></div>
          <br><br>
          <div style="text-align: center;">¡Gracias por tu compra!</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleSendWhatsApp = (phone, id) => {
    if (!phone) return alert('No hay número de teléfono registrado');
    const msg = encodeURIComponent(`Hola, te escribimos de Distrito BG sobre tu pedido #${id.toString().padStart(4, '0')}.`);
    window.open(`https://wa.me/57${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrderCart.length === 0) return alert('El carrito está vacío');
    const total = newOrderCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
      const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: newOrderCustomer,
          cart: newOrderCart,
          total,
          source: newOrderCustomer.source
        })
      });
      if (res.ok) {
        setIsNewOrderOpen(false);
        setNewOrderCart([]);
        setNewOrderCustomer({ name: 'Cliente Local', phone: '0000000000', address: '', deliveryType: 'presencial', paymentMethod: 'efectivo', source: 'Presencial' });
        fetchOrders();
      }
    } catch (err) { console.error(err); }
  };

  const addToCart = (prod) => {
    setNewOrderCart(prev => {
      const ex = prev.find(i => i.id === prod.id);
      if (ex) return prev.map(i => i.id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...prod, quantity: 1, title: prod.title, price: prod.price }];
    });
  };

  const updateCartQty = (id, delta) => {
    setNewOrderCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQ = i.quantity + delta;
        return newQ > 0 ? { ...i, quantity: newQ } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const tabs = ['Todos', 'Nuevos', 'En preparación', 'Listos', 'En camino', 'Entregados', 'Cancelados'];

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === 'Todos' || 
                      (activeTab === 'Nuevos' && order.status === 'Nuevo') ||
                      (activeTab === 'En preparación' && order.status === 'En preparación') ||
                      (activeTab === 'Listos' && order.status === 'Listo') ||
                      (activeTab === 'En camino' && order.status === 'En camino') ||
                      (activeTab === 'Entregados' && order.status === 'Entregado') ||
                      (activeTab === 'Cancelados' && order.status === 'Cancelado');
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
                          order.id.toString().includes(searchLower) ||
                          (order.customer_name && order.customer_name.toLowerCase().includes(searchLower)) ||
                          (order.customer_phone && order.customer_phone.includes(searchLower));
                          
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const styles = {
      'Nuevo': { bg: 'rgba(212, 160, 23, 0.15)', color: '#D4A017' },
      'En preparación': { bg: 'rgba(59, 130, 246, 0.15)', color: '#60A5FA' },
      'Listo': { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80' },
      'En camino': { bg: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' },
      'Entregado': { bg: 'rgba(34, 197, 94, 0.25)', color: '#FFFFFF' },
      'Cancelado': { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171' }
    };
    const s = styles[status] || styles['Nuevo'];
    return (
      <span style={{ backgroundColor: s.bg, color: s.color, padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
        {status}
      </span>
    );
  };

  const getSourceIcon = (source) => {
    if (source === 'WhatsApp') return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageCircle size={16} color="#22C55E" /> WhatsApp</div>;
    if (source === 'Presencial') return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Store size={16} color="#D4A017" /> Presencial</div>;
    if (source === 'Teléfono') return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16} color="#60A5FA" /> Teléfono</div>;
    return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={16} color="#A78BFA" /> Web</div>;
  };

  const getPaymentIcon = (method) => {
    if (!method) return '-';
    const m = method.toLowerCase();
    if (m.includes('efectivo')) return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Banknote size={16} color="#4ADE80" /> Efectivo</div>;
    if (m.includes('nequi') || m.includes('daviplata')) return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={16} color="#A78BFA" /> {method}</div>;
    if (m.includes('tarjeta')) return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={16} color="#FBBF24" /> Tarjeta</div>;
    return <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Banknote size={16} color="#BDBDBD" /> {method}</div>;
  };

  const getTimeElapsed = (dateString) => {
    if (!dateString) return '-';
    const start = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - start) / 60000);
    const isLate = diffMins > 45; // Ejemplo: 45 min máximo
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isLate ? '#EF4444' : '#BDBDBD', fontWeight: isLate ? '600' : '400' }}>
        <Clock size={16} /> {diffMins} min
      </div>
    );
  };

  const statNuevos = orders.filter(o => o.status === 'Nuevo').length;
  const statPreparacion = orders.filter(o => o.status === 'En preparación').length;
  const statEntregados = orders.filter(o => o.status === 'Entregado').length;
  const totalVentas = orders.filter(o => o.status !== 'Cancelado').reduce((acc, o) => acc + (o.total || 0), 0);

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      
      {/* Navegación y Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Dashboard <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#FFFFFF' }}>Pedidos</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Pedidos</h1>
          <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>Administra todos los pedidos recibidos por web, WhatsApp, teléfono y presencial.</p>
        </div>
        
        <button 
          onClick={() => setIsNewOrderOpen(true)}
          style={{ 
            backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', height: '48px', 
            padding: '0 24px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
        }}>
          <Plus size={20} /> Nuevo Pedido
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {[
          { label: 'Pedidos de hoy', value: orders.length, icon: <ShoppingCart size={24} /> },
          { label: 'Pedidos pendientes', value: statNuevos, icon: <Clock size={24} /> },
          { label: 'En preparación', value: statPreparacion, icon: <ChefHat size={24} /> },
          { label: 'Pedidos entregados', value: statEntregados, icon: <CheckCircle size={24} /> },
          { label: 'Ventas del día', value: `$${totalVentas.toLocaleString()}`, icon: <Banknote size={24} /> },
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#111111', borderRadius: '20px', padding: '24px', border: '1px solid #222222', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#D4A017' }}>{stat.icon}</div>
            <div>
              <div style={{ fontSize: '30px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1' }}>{stat.value}</div>
              <div style={{ color: '#BDBDBD', fontSize: '13px', fontWeight: '500', marginTop: '6px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#6B7280' }} />
          <input 
            type="text" 
            placeholder="Buscar pedido, cliente o teléfono..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 16px 16px 48px', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
        <button style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 20px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
          <Filter size={18} color="#D4A017" /> Filtros
        </button>
      </div>

      {/* Pestañas de Estado */}
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab;
          let count = 0;
          if (tab === 'Todos') count = orders.length;
          else if (tab === 'Nuevos') count = statNuevos;
          else if (tab === 'En preparación') count = statPreparacion;
          else if (tab === 'Listos') count = orders.filter(o => o.status === 'Listo').length;
          else if (tab === 'En camino') count = orders.filter(o => o.status === 'En camino').length;
          else if (tab === 'Entregados') count = statEntregados;
          else if (tab === 'Cancelados') count = orders.filter(o => o.status === 'Cancelado').length;

          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                backgroundColor: isActive ? '#D4A017' : '#111111', 
                color: isActive ? '#000000' : '#FFFFFF', 
                border: isActive ? 'none' : '1px solid #2A2A2A', 
                borderRadius: '999px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', 
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {tab}
              <span style={{ 
                backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : '#2A2A2A', 
                color: isActive ? '#000000' : '#BDBDBD', 
                padding: '2px 8px', borderRadius: '999px', fontSize: '12px' 
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tabla de Pedidos */}
      <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead>
              <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #222222' }}>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Pedido</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Cliente</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Origen</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Estado</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Total</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Método de pago</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Tiempo</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id} style={{ borderBottom: index === filteredOrders.length - 1 ? 'none' : '1px solid #222222' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '16px' }}>#{order.id.toString().padStart(4, '0')}</div>
                    <div style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '15px' }}>{order.customer_name || 'Sin nombre'}</div>
                    <div style={{ color: '#BDBDBD', fontSize: '13px', marginTop: '4px' }}>{order.customer_phone || 'Sin teléfono'}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                    {getSourceIcon(order.source || 'Web')}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getStatusBadge(order.status || 'Nuevo')}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>
                    ${(order.total || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                    {getPaymentIcon(order.payment_method)}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {getTimeElapsed(order.created_at)}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', position: 'relative' }}>
                      <button onClick={() => setSelectedOrder(order)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handlePrintOrder(order)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <Printer size={16} />
                      </button>
                      <button onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <MoreVertical size={16} />
                      </button>

                      {openMenuId === order.id && (
                        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '8px', zIndex: 10, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '170px' }}>
                          <button onClick={() => { handleSendWhatsApp(order.customer_phone, order.id); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid #333333', color: '#FFF', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <MessageCircle size={16} color="#22C55E" /> WhatsApp
                          </button>
                          <button onClick={() => { handleUpdateStatus(order.id, 'Cancelado'); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid #333333', color: '#F59E0B', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <X size={16} /> Anular Orden
                          </button>
                          <button onClick={() => { handleDeleteOrder(order.id); setOpenMenuId(null); }} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#EF4444', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Trash2 size={16} /> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: '#BDBDBD' }}>
                    No hay pedidos que coincidan con esta vista.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111111' }}>
          <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>
            Mostrando {filteredOrders.length > 0 ? 1 : 0} a {filteredOrders.length} de {filteredOrders.length} pedidos
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'not-allowed' }}>
              <ChevronLeft size={18} />
            </button>
            <button style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#D4A017', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000000', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              1
            </button>
            <button style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'not-allowed' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detalle de Pedido */}
      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'flex-end', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#111111', height: '100%', borderLeft: '1px solid #222222', display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '24px' }}>Pedido #{selectedOrder.id.toString().padStart(4, '0')}</h2>
                <div style={{ color: '#BDBDBD', fontSize: '14px', marginTop: '4px' }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                {getStatusBadge(selectedOrder.status || 'Nuevo')}
                <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>
                  {getSourceIcon(selectedOrder.source || 'Web')}
                </div>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ color: '#BDBDBD', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Cliente</h3>
                <div style={{ color: '#FFFFFF', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{selectedOrder.customer_name}</div>
                <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '12px' }}>{selectedOrder.customer_phone}</div>
                <div style={{ borderTop: '1px solid #333333', paddingTop: '12px' }}>
                  <div style={{ color: '#BDBDBD', fontSize: '14px' }}><strong>Dirección:</strong> {selectedOrder.address}, {selectedOrder.barrio}</div>
                  <div style={{ color: '#BDBDBD', fontSize: '14px', marginTop: '4px' }}><strong>Entrega:</strong> {selectedOrder.delivery_type}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                <h3 style={{ color: '#BDBDBD', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Productos</h3>
                {selectedOrder.cart_json && selectedOrder.cart_json.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: idx < selectedOrder.cart_json.length - 1 ? '1px solid #333333' : 'none', paddingBottom: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: '500' }}>{item.quantity}x {item.title}</div>
                      {item.notes && <div style={{ color: '#D4A017', fontSize: '13px', marginTop: '4px' }}>Nota: {item.notes}</div>}
                    </div>
                    <div style={{ color: '#FFFFFF', fontWeight: '600' }}>${(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #333333', paddingTop: '12px', marginTop: '4px' }}>
                  <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '18px' }}>Total</div>
                  <div style={{ color: '#D4A017', fontWeight: '800', fontSize: '18px' }}>${(selectedOrder.total || 0).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ color: '#BDBDBD', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Pago</h3>
                <div style={{ color: '#FFFFFF', fontSize: '15px' }}>{getPaymentIcon(selectedOrder.payment_method)}</div>
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid #222222', backgroundColor: '#181818', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'En preparación')}
                style={{ padding: '12px', backgroundColor: '#3B82F6', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Preparar
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'En camino')}
                style={{ padding: '12px', backgroundColor: '#F59E0B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Despachar
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'Entregado')}
                style={{ padding: '12px', backgroundColor: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', gridColumn: 'span 2' }}
              >
                Marcar Entregado
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Pedido (POS) */}
      {isNewOrderOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', zIndex: 1000 }}>
          <div style={{ flex: 1, backgroundColor: '#0D0D0D', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '24px' }}>Menú de Productos</h2>
              <div style={{ position: 'relative', width: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#6B7280' }} />
                <input 
                  type="text" placeholder="Buscar producto..." 
                  value={posSearch} onChange={e => setPosSearch(e.target.value)}
                  style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '8px', padding: '10px 10px 10px 36px', color: '#FFF', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', alignContent: 'start' }}>
              {products.filter(p => p.title.toLowerCase().includes(posSearch.toLowerCase())).map(p => (
                <div key={p.id} onClick={() => addToCart(p)} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'border 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = '#D4A017'} onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}>
                  {p.image && p.image.startsWith('http') ? <img src={p.image} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} /> : <div style={{ height: '120px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChefHat size={32} color="#333" /></div>}
                  <div style={{ padding: '12px' }}>
                    <div style={{ color: '#FFF', fontWeight: '600', fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ color: '#D4A017', fontWeight: '700' }}>${(p.price || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ width: '400px', backgroundColor: '#111111', borderLeft: '1px solid #222222', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '20px' }}>Orden Actual</h2>
              <button onClick={() => setIsNewOrderOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {newOrderCart.length === 0 ? (
                <div style={{ color: '#6B7280', textAlign: 'center', marginTop: '40px' }}>Haz clic en los productos para agregarlos</div>
              ) : (
                newOrderCart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#1A1A1A', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#FFF', fontWeight: '600', fontSize: '14px' }}>{item.title}</div>
                      <div style={{ color: '#D4A017', fontSize: '13px' }}>${((item.price || 0) * item.quantity).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#222', padding: '4px 8px', borderRadius: '8px' }}>
                      <button onClick={() => updateCartQty(item.id, -1)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '16px' }}>-</button>
                      <span style={{ color: '#FFF', fontWeight: '600' }}>{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '16px' }}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid #222222', backgroundColor: '#181818' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <input type="text" placeholder="Nombre cliente" value={newOrderCustomer.name} onChange={e => setNewOrderCustomer({...newOrderCustomer, name: e.target.value})} style={{ backgroundColor: '#111', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }} />
                <input type="text" placeholder="Teléfono" value={newOrderCustomer.phone} onChange={e => setNewOrderCustomer({...newOrderCustomer, phone: e.target.value})} style={{ backgroundColor: '#111', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <select value={newOrderCustomer.source} onChange={e => setNewOrderCustomer({...newOrderCustomer, source: e.target.value})} style={{ flex: 1, backgroundColor: '#111', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }}>
                  <option value="Presencial">Presencial</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Teléfono">Teléfono</option>
                </select>
                <select value={newOrderCustomer.paymentMethod} onChange={e => setNewOrderCustomer({...newOrderCustomer, paymentMethod: e.target.value})} style={{ flex: 1, backgroundColor: '#111', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }}>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta (POS)</option>
                  <option value="nequi">Nequi / Transf</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '20px' }}>
                <span style={{ color: '#FFF', fontWeight: '600' }}>Total:</span>
                <span style={{ color: '#D4A017', fontWeight: '800' }}>${newOrderCart.reduce((s, i) => s + (i.price || 0) * i.quantity, 0).toLocaleString()}</span>
              </div>

              <button onClick={handleCreateOrder} style={{ width: '100%', padding: '14px', backgroundColor: '#D4A017', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>
                Confirmar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

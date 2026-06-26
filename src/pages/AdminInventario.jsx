import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Filter, Plus, Beef, Sandwich, Milk, 
  Leaf, Droplets, Snowflake, Box, Pencil, ArrowDownCircle, 
  ArrowUpCircle, History, AlertTriangle, Trash2, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, DollarSign, X, Receipt
} from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminInventario() {
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [activeTab, setActiveTab] = useState('Ingredientes');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const [currentItem, setCurrentItem] = useState({
    id: null, image: '', name: '', type: 'Ingrediente', category: 'Carnes', 
    unit: 'Kg', stock: 0, min_stock: 0, expiry_date: '', unit_cost: 0, supplier: ''
  });
  
  const [currentMove, setCurrentMove] = useState({
    inventory_id: null, movement_type: 'IN', quantity: 0, notes: ''
  });

  // Purchase State
  const [newPurchase, setNewPurchase] = useState({
    invoice_number: '', supplier: '', purchase_date: new Date().toISOString().split('T')[0], notes: '', items: []
  });
  const [purchaseItemSearch, setPurchaseItemSearch] = useState('');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('distrito_admin_token');
      const resItems = await fetch(`${API_URL}/admin/inventory`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataItems = await resItems.json();
      if (dataItems.status === 'ok') setItems(dataItems.items);

      const resPurchases = await fetch(`${API_URL}/admin/purchases`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataPurchases = await resPurchases.json();
      if (dataPurchases.status === 'ok') setPurchases(dataPurchases.purchases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!currentItem.name) return alert('El nombre es requerido');
    
    const token = localStorage.getItem('distrito_admin_token');
    const method = currentItem.id ? 'PUT' : 'POST';
    const url = currentItem.id ? `${API_URL}/admin/inventory/${currentItem.id}` : `${API_URL}/admin/inventory`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentItem)
      });
      if (res.ok) {
        setIsItemModalOpen(false);
        fetchData();
      } else {
        alert('Error al guardar el ítem');
      }
    } catch (err) { console.error(err); }
  };

  const handleSaveMovement = async (e) => {
    e.preventDefault();
    if (currentMove.quantity <= 0) return alert('La cantidad debe ser mayor a 0');
    
    const token = localStorage.getItem('distrito_admin_token');
    try {
      const res = await fetch(`${API_URL}/admin/inventory/${currentMove.inventory_id}/movement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(currentMove)
      });
      if (res.ok) {
        setIsMoveModalOpen(false);
        fetchData();
      } else {
        alert('Error al registrar movimiento');
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este ítem del inventario?')) return;
    const token = localStorage.getItem('distrito_admin_token');
    try {
      await fetch(`${API_URL}/admin/inventory/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleSavePurchase = async (e) => {
    e.preventDefault();
    if (newPurchase.items.length === 0) return alert('Debes agregar al menos un ítem a la compra');
    
    const token = localStorage.getItem('distrito_admin_token');
    const total_amount = newPurchase.items.reduce((sum, item) => sum + item.total_cost, 0);

    try {
      const res = await fetch(`${API_URL}/admin/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newPurchase, total_amount })
      });
      if (res.ok) {
        setIsPurchaseModalOpen(false);
        setNewPurchase({ invoice_number: '', supplier: '', purchase_date: new Date().toISOString().split('T')[0], notes: '', items: [] });
        fetchData();
      } else {
        alert('Error al registrar compra');
      }
    } catch (err) { console.error(err); }
  };

  // Cálculos estadísticos
  const totalValue = items.reduce((sum, item) => sum + (item.stock * item.unit_cost), 0);
  const lowStockCount = items.filter(i => i.stock > 0 && i.stock <= i.min_stock).length;
  const outOfStockCount = items.filter(i => i.stock <= 0).length;
  
  // Filtros
  const tabs = ['Ingredientes', 'Kits', 'Insumos', 'Empaques', 'Compras'];
  
  const filteredItems = items.filter(item => {
    if (activeTab === 'Compras') return false;
    const matchesTab = item.type === (activeTab === 'Kits' ? 'Kit' : activeTab.slice(0, -1));
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStockColor = (stock, min) => {
    if (stock <= 0) return '#EF4444'; 
    if (stock <= min) return '#F59E0B'; 
    return '#22C55E'; 
  };

  const getStatusBadge = (stock, min) => {
    if (stock <= 0) return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Agotado</span>;
    if (stock <= min) return <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Stock Bajo</span>;
    return <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>En stock</span>;
  };

  const getCategoryBadge = (cat) => {
    const colors = {
      'Carnes': { bg: '#451a03', color: '#fca5a5' },
      'Panadería': { bg: '#422006', color: '#fde047' },
      'Lácteos': { bg: '#1e3a8a', color: '#bfdbfe' },
      'Verduras': { bg: '#14532d', color: '#86efac' },
      'Salsas': { bg: '#7f1d1d', color: '#fca5a5' },
      'Bebidas': { bg: '#0f766e', color: '#5eead4' },
      'Empaques': { bg: '#3f3f46', color: '#d4d4d8' }
    };
    const c = colors[cat] || { bg: '#27272a', color: '#e4e4e7' };
    return <span style={{ backgroundColor: c.bg, color: c.color, padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>{cat}</span>;
  };

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Dashboard <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#FFFFFF' }}>Inventario</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Inventario</h1>
          <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>Administra todos los ingredientes, compras y existencias.</p>
        </div>
      </div>

      {/* Tarjetas Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Valor del Inventario', value: `$${totalValue.toLocaleString()}`, icon: <DollarSign size={24} />, color: '#D4A017' },
          { label: 'Total de Ítems', value: items.length, icon: <Package size={24} />, color: '#3B82F6' },
          { label: 'Stock Bajo', value: lowStockCount, icon: <TrendingDown size={24} />, color: '#F59E0B' },
          { label: 'Agotados', value: outOfStockCount, icon: <AlertTriangle size={24} />, color: '#EF4444' }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#111111', borderRadius: '20px', padding: '24px', border: '1px solid #222222', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1' }}>{stat.value}</div>
              </div>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', backgroundColor: stat.color }} />
          </div>
        ))}
      </div>

      {/* Pestañas */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #222222', paddingBottom: '16px', marginBottom: '24px', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab;
          return (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                backgroundColor: isActive ? '#D4A017' : 'transparent', 
                color: isActive ? '#000000' : '#BDBDBD', 
                border: 'none', borderRadius: '999px', padding: '10px 24px', fontSize: '15px', fontWeight: '600', 
                cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Barra de Herramientas */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '300px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#6B7280' }} />
            <input 
              type="text" 
              placeholder={activeTab === 'Compras' ? "Buscar factura o proveedor..." : "Buscar ingrediente..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '16px 16px 16px 48px', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <button style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 20px', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
            <Filter size={18} color="#D4A017" /> Filtros
          </button>
        </div>
        
        {activeTab === 'Compras' ? (
          <button 
            onClick={() => setIsPurchaseModalOpen(true)}
            style={{ backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', height: '52px', padding: '0 24px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Receipt size={20} /> Registrar Compra
          </button>
        ) : (
          <button 
            onClick={() => {
              setCurrentItem({ id: null, image: '', name: '', type: activeTab === 'Kits' ? 'Kit' : activeTab === 'Empaques' ? 'Empaque' : activeTab.substring(0, activeTab.length-1), category: 'Carnes', unit: 'Kg', stock: 0, min_stock: 0, expiry_date: '', unit_cost: 0, supplier: '' });
              setIsItemModalOpen(true);
            }}
            style={{ backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', height: '52px', padding: '0 24px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          >
            <Plus size={20} /> Nuevo {activeTab === 'Kits' ? 'Kit' : activeTab === 'Empaques' ? 'Empaque' : activeTab.substring(0, activeTab.length-1)}
          </button>
        )}
      </div>

      {/* Tabla Principal */}
      <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'Compras' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #222222' }}>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Fecha</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Factura #</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Proveedor</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase, index) => (
                  <tr key={purchase.id} style={{ borderBottom: index === purchases.length - 1 ? 'none' : '1px solid #222222', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '500' }}>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td style={{ padding: '16px 24px', color: '#D4A017', fontWeight: '700' }}>{purchase.invoice_number || 'S/N'}</td>
                    <td style={{ padding: '16px 24px', color: '#FFFFFF' }}>{purchase.supplier || 'Varios'}</td>
                    <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '700' }}>${(purchase.total_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', color: '#BDBDBD' }}>{purchase.notes}</td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No hay compras registradas</td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #222222' }}>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Ítem</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Categoría</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Stock Actual</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Min.</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Estado</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Valor Unit.</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: index === filteredItems.length - 1 ? 'none' : '1px solid #222222', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1A1A1A', backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid #333' }} />
                        <div>
                          <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>{item.name}</div>
                          <div style={{ color: '#BDBDBD', fontSize: '13px', marginTop: '2px' }}>{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>{getCategoryBadge(item.category)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ color: getStockColor(item.stock, item.min_stock), fontWeight: '800', fontSize: '16px' }}>
                        {item.stock} <span style={{ fontSize: '13px', fontWeight: '500', color: '#888' }}>{item.unit}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>{item.min_stock} {item.unit}</td>
                    <td style={{ padding: '16px 24px' }}>{getStatusBadge(item.stock, item.min_stock)}</td>
                    <td style={{ padding: '16px 24px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500' }}>${(item.unit_cost || 0).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', color: '#D4A017', fontSize: '15px', fontWeight: '700' }}>${((item.unit_cost || 0) * item.stock).toLocaleString()}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button title="Entrada" onClick={() => { setCurrentMove({ inventory_id: item.id, movement_type: 'IN', quantity: 0, notes: '' }); setIsMoveModalOpen(true); }} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ADE80', cursor: 'pointer' }}>
                          <ArrowDownCircle size={16} />
                        </button>
                        <button title="Salida" onClick={() => { setCurrentMove({ inventory_id: item.id, movement_type: 'OUT', quantity: 0, notes: '' }); setIsMoveModalOpen(true); }} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                          <ArrowUpCircle size={16} />
                        </button>
                        <button title="Editar" onClick={() => { setCurrentItem(item); setIsItemModalOpen(true); }} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                          <Pencil size={16} />
                        </button>
                        <button title="Eliminar" onClick={() => handleDelete(item.id)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Crear/Editar Ítem */}
      {isItemModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111111', width: '600px', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '20px' }}>{currentItem.id ? 'Editar Ítem' : 'Nuevo Ítem'}</h2>
              <button onClick={() => setIsItemModalOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveItem} style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Nombre</label>
                  <input required type="text" value={currentItem.name} onChange={e => setCurrentItem({...currentItem, name: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Categoría</label>
                  <input 
                    type="text" 
                    list="inventory-category-options"
                    value={currentItem.category} 
                    onChange={e => setCurrentItem({...currentItem, category: e.target.value})} 
                    placeholder="Selecciona o escribe una nueva..."
                    style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} 
                  />
                  <datalist id="inventory-category-options">
                    <option value="Carnes" />
                    <option value="Panadería" />
                    <option value="Lácteos" />
                    <option value="Verduras" />
                    <option value="Salsas" />
                    <option value="Bebidas" />
                    <option value="Empaques" />
                    <option value="Limpieza" />
                    {Array.from(new Set(items.map(i => i.category))).filter(c => !['Carnes','Panadería','Lácteos','Verduras','Salsas','Bebidas','Empaques','Limpieza'].includes(c)).map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Unidad de Medida</label>
                  <select value={currentItem.unit} onChange={e => setCurrentItem({...currentItem, unit: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }}>
                    <option value="Kg">Kg</option>
                    <option value="Gramos">Gramos</option>
                    <option value="Litros">Litros</option>
                    <option value="Mililitros">Mililitros</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Paquetes">Paquetes</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Costo Unitario ($)</label>
                  <input type="number" value={currentItem.unit_cost} onChange={e => setCurrentItem({...currentItem, unit_cost: parseInt(e.target.value) || 0})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Stock Mínimo</label>
                  <input type="number" value={currentItem.min_stock} onChange={e => setCurrentItem({...currentItem, min_stock: parseFloat(e.target.value) || 0})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>URL de Imagen</label>
                  <input type="text" placeholder="https://..." value={currentItem.image} onChange={e => setCurrentItem({...currentItem, image: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} />
                </div>
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#D4A017', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '8px' }}>
                Guardar Ítem
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Movimiento Rápido */}
      {isMoveModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111111', width: '400px', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: currentMove.movement_type === 'IN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
              <h2 style={{ color: currentMove.movement_type === 'IN' ? '#4ADE80' : '#EF4444', margin: 0, fontSize: '20px' }}>
                {currentMove.movement_type === 'IN' ? 'Entrada Rápida' : 'Salida de Inventario'}
              </h2>
              <button onClick={() => setIsMoveModalOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveMovement} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Cantidad</label>
                <input required type="number" step="0.01" value={currentMove.quantity} onChange={e => setCurrentMove({...currentMove, quantity: parseFloat(e.target.value) || 0})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '16px', borderRadius: '10px', color: '#FFF', outline: 'none', fontSize: '20px', fontWeight: 'bold' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '14px' }}>Notas / Motivo (Opcional)</label>
                <input type="text" value={currentMove.notes} onChange={e => setCurrentMove({...currentMove, notes: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '12px', borderRadius: '10px', color: '#FFF', outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: currentMove.movement_type === 'IN' ? '#22C55E' : '#EF4444', color: '#FFF', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                Confirmar {currentMove.movement_type === 'IN' ? 'Entrada' : 'Salida'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Compra Global */}
      {isPurchaseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111111', width: '900px', maxHeight: '90vh', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A' }}>
              <h2 style={{ color: '#D4A017', margin: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Receipt size={24} /> Registrar Nueva Compra (Factura)</h2>
              <button onClick={() => setIsPurchaseModalOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Buscador de ítems (Izquierda) */}
              <div style={{ width: '350px', borderRight: '1px solid #222222', display: 'flex', flexDirection: 'column', backgroundColor: '#181818' }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                    <input 
                      type="text" placeholder="Buscar insumo..." value={purchaseItemSearch} onChange={e => setPurchaseItemSearch(e.target.value)}
                      style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', padding: '10px 10px 10px 36px', borderRadius: '8px', color: '#FFF', outline: 'none' }} 
                    />
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px 16px' }}>
                  {items.filter(i => i.name.toLowerCase().includes(purchaseItemSearch.toLowerCase())).map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#111', borderRadius: '8px', marginBottom: '8px', border: '1px solid #222' }}>
                      <div>
                        <div style={{ color: '#FFF', fontWeight: '600', fontSize: '13px' }}>{item.name}</div>
                        <div style={{ color: '#888', fontSize: '12px' }}>Actual: {item.stock} {item.unit}</div>
                      </div>
                      <button 
                        onClick={() => {
                          if (!newPurchase.items.find(i => i.inventory_id === item.id)) {
                            setNewPurchase({
                              ...newPurchase, 
                              items: [...newPurchase.items, { inventory_id: item.id, name: item.name, unit: item.unit, quantity: 1, unit_cost: item.unit_cost, total_cost: item.unit_cost }]
                            });
                          }
                        }}
                        style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulario Factura (Derecha) */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Fecha Compra</label>
                    <input type="date" value={newPurchase.purchase_date} onChange={e => setNewPurchase({...newPurchase, purchase_date: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '13px' }}>Proveedor</label>
                    <input type="text" placeholder="Macro, D1..." value={newPurchase.supplier} onChange={e => setNewPurchase({...newPurchase, supplier: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ color: '#BDBDBD', display: 'block', marginBottom: '8px', fontSize: '13px' }}>N° Factura (Opc.)</label>
                    <input type="text" placeholder="FAC-1234" value={newPurchase.invoice_number} onChange={e => setNewPurchase({...newPurchase, invoice_number: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333', padding: '10px', borderRadius: '8px', color: '#FFF', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ flex: 1, backgroundColor: '#111', borderRadius: '12px', border: '1px solid #222', padding: '16px', marginBottom: '24px', overflowY: 'auto' }}>
                  <div style={{ color: '#FFF', fontWeight: '600', marginBottom: '16px', borderBottom: '1px solid #222', paddingBottom: '8px' }}>Ítems en Factura</div>
                  {newPurchase.items.length === 0 ? (
                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>Agrega ítems desde la lista izquierda</div>
                  ) : (
                    newPurchase.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px', padding: '12px', backgroundColor: '#1A1A1A', borderRadius: '8px' }}>
                        <div style={{ color: '#FFF', fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                        <div>
                          <label style={{ color: '#888', fontSize: '11px', display: 'block' }}>Cant. ({item.unit})</label>
                          <input type="number" step="0.01" value={item.quantity} onChange={e => {
                            const qty = parseFloat(e.target.value) || 0;
                            const newItems = [...newPurchase.items];
                            newItems[idx] = { ...item, quantity: qty, total_cost: qty * item.unit_cost };
                            setNewPurchase({...newPurchase, items: newItems});
                          }} style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', padding: '6px', borderRadius: '4px', color: '#FFF' }} />
                        </div>
                        <div>
                          <label style={{ color: '#888', fontSize: '11px', display: 'block' }}>Costo Unit.</label>
                          <input type="number" value={item.unit_cost} onChange={e => {
                            const cost = parseInt(e.target.value) || 0;
                            const newItems = [...newPurchase.items];
                            newItems[idx] = { ...item, unit_cost: cost, total_cost: item.quantity * cost };
                            setNewPurchase({...newPurchase, items: newItems});
                          }} style={{ width: '100%', backgroundColor: '#111', border: '1px solid #333', padding: '6px', borderRadius: '4px', color: '#FFF' }} />
                        </div>
                        <div style={{ color: '#D4A017', fontWeight: '700', fontSize: '14px', textAlign: 'right' }}>
                          ${item.total_cost.toLocaleString()}
                        </div>
                        <button onClick={() => {
                          const newItems = newPurchase.items.filter((_, i) => i !== idx);
                          setNewPurchase({...newPurchase, items: newItems});
                        }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                  <div>
                    <div style={{ color: '#BDBDBD', fontSize: '14px' }}>Total Factura</div>
                    <div style={{ color: '#FFF', fontSize: '28px', fontWeight: '800' }}>
                      ${newPurchase.items.reduce((s, i) => s + i.total_cost, 0).toLocaleString()}
                    </div>
                  </div>
                  <button onClick={handleSavePurchase} style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', borderRadius: '12px', padding: '16px 32px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
                    Guardar Compra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

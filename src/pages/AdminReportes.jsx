import React, { useState, useEffect, Component } from 'react';
import { 
  BarChart3, DollarSign, ShoppingCart, Package, Warehouse, Users, 
  Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon, 
  Calendar, Download, Filter, AlertTriangle, Clock, Star, Eye, X 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

const COLORS = ['#D4A017', '#8B5CF6', '#3B82F6', '#22C55E', '#EF4444', '#F5C542'];

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 40, color: 'red'}}><h1>Algo salió mal en los Reportes:</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children; 
  }
}

export default function AdminReportes() {
  return (
    <ErrorBoundary>
      <AdminReportesInner />
    </ErrorBoundary>
  )
}

function AdminReportesInner() {
  const [data, setData] = useState({ kpis: {}, charts: { ventas: [], categorias: [], pagos: [] }, lists: { productos: [], clientes: [] } });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Resumen');
  const [dateRange, setDateRange] = useState('Últimos 30 días');
  const [selectedClient, setSelectedClient] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/api/pedidos/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        setData({
          kpis: json.kpis || {},
          charts: json.charts || { ventas: [], categorias: [], pagos: [] },
          lists: json.lists || { productos: [], clientes: [] }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = ['Resumen', 'Ventas', 'Productos', 'Inventario', 'Clientes', 'Finanzas', 'Pedidos', 'Comparativos'];

  const totalCategorias = (data.charts?.categorias || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalPagos = (data.charts?.pagos || []).reduce((acc, curr) => acc + (curr.value || 0), 0);

  if (loading) return <div style={{ color: '#FFF', padding: '40px', textAlign: 'center' }}>Cargando inteligencia de negocio...</div>;

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', padding: '40px', fontFamily: 'Montserrat, sans-serif' }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '13px', marginBottom: '8px' }}>
            Dashboard &gt; <span style={{ color: '#FFF' }}>Reportes</span>
          </div>
          <h1 style={{ color: '#FFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Reportes</h1>
          <p style={{ color: '#BDBDBD', margin: 0, fontSize: '14px' }}>Analiza el rendimiento completo del restaurante en tiempo real.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#111', border: '1px solid #222', padding: '10px 16px', borderRadius: '8px', color: '#FFF', gap: '8px', cursor: 'pointer' }}>
            <Calendar size={18} color="#BDBDBD" />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{dateRange}</span>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', backgroundColor: '#D4A017', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '700', gap: '8px', cursor: 'pointer' }}>
            <Download size={18} />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #222', marginBottom: '32px', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <div 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '12px 0', 
              color: activeTab === tab ? '#D4A017' : '#BDBDBD', 
              fontWeight: activeTab === tab ? '700' : '500',
              borderBottom: activeTab === tab ? '2px solid #D4A017' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: 'Ventas totales', value: `$${(data.kpis?.totalVentas || 0).toLocaleString()}`, icon: <DollarSign size={24} color="#D4A017" />, trend: '+12%', isUp: true },
          { title: 'Pedidos realizados', value: data.kpis?.pedidosRealizados || 0, icon: <ShoppingCart size={24} color="#3B82F6" />, trend: '+5%', isUp: true },
          { title: 'Clientes atendidos', value: data.kpis?.clientesAtendidos || 0, icon: <Users size={24} color="#8B5CF6" />, trend: '+8%', isUp: true },
          { title: 'Ticket promedio', value: `$${(data.kpis?.ticketPromedio || 0).toLocaleString()}`, icon: <BarChart3 size={24} color="#F5C542" />, trend: '-2%', isUp: false },
          { title: 'Utilidad bruta', value: `$${(data.kpis?.utilidadBruta || 0).toLocaleString()}`, icon: <Wallet size={24} color="#22C55E" />, trend: '+15%', isUp: true }
        ].map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#1A1A1A', padding: '12px', borderRadius: '12px' }}>{kpi.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: kpi.isUp ? '#22C55E' : '#EF4444', fontSize: '13px', fontWeight: '600' }}>
                {kpi.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {kpi.trend}
              </div>
            </div>
            <div style={{ color: '#BDBDBD', fontSize: '13px', marginBottom: '4px', fontWeight: '500' }}>{kpi.title}</div>
            <div style={{ color: '#FFF', fontSize: '24px', fontWeight: '800' }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ color: '#FFF', margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700' }}>Ventas por día</h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.charts?.ventas || []}>
                <XAxis dataKey="date" stroke="#BDBDBD" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#BDBDBD" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <RechartsTooltip cursor={{fill: '#1A1A1A'}} contentStyle={{backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '8px'}} itemStyle={{color: '#D4A017'}} />
                <Bar dataKey="ventas" fill="#D4A017" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ color: '#FFF', margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700' }}>Ventas por Categoría</h3>
          <div style={{ display: 'flex', alignItems: 'center', height: '250px' }}>
            <div style={{ position: 'relative', width: '55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts?.categorias || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(data.charts?.categorias || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '8px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ color: '#BDBDBD', fontSize: '11px', marginBottom: '2px' }}>Total</span>
                <span style={{ color: '#FFF', fontWeight: '800', fontSize: '15px' }}>${totalCategorias.toLocaleString()}</span>
              </div>
            </div>
            
            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px', overflowY: 'auto', maxHeight: '100%' }}>
              {(data.charts?.categorias || []).map((cat, i) => {
                const percentage = totalCategorias > 0 ? Math.round((cat.value / totalCategorias) * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#BDBDBD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length], flexShrink: 0 }}></div>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }} title={cat.name}>{cat.name}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: '#FFF' }}>{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ color: '#FFF', margin: '0 0 24px 0', fontSize: '16px', fontWeight: '700' }}>Métodos de Pago</h3>
          <div style={{ display: 'flex', alignItems: 'center', height: '250px' }}>
            <div style={{ position: 'relative', width: '55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.charts?.pagos || []} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {(data.charts?.pagos || []).map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '8px'}} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ color: '#BDBDBD', fontSize: '11px', marginBottom: '2px' }}>Total</span>
                <span style={{ color: '#FFF', fontWeight: '800', fontSize: '15px' }}>${totalPagos.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ width: '45%', display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '8px', overflowY: 'auto', maxHeight: '100%' }}>
              {(data.charts?.pagos || []).map((pago, i) => {
                const percentage = totalPagos > 0 ? Math.round((pago.value / totalPagos) * 100) : 0;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#BDBDBD' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[(i + 2) % COLORS.length], flexShrink: 0 }}></div>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85px' }} title={pago.name}>{pago.name}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: '#FFF' }}>{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Paneles Informativos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: '#FFF', margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={18} color="#D4A017" /> Productos más vendidos</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(data.lists?.productos || []).map((prod, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#D4A017', fontWeight: '800' }}>{i+1}</div>
                  <div>
                    <div style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>{prod.name}</div>
                    <div style={{ color: '#BDBDBD', fontSize: '12px' }}>{prod.quantity} unidades</div>
                  </div>
                </div>
                <div style={{ color: '#FFF', fontWeight: '700', fontSize: '14px' }}>${(prod.total || 0).toLocaleString()}</div>
              </div>
            ))}
            {(data.lists?.productos || []).length === 0 && <div style={{ color: '#666', textAlign: 'center' }}>No hay datos suficientes</div>}
          </div>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: '#FFF', margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={18} color="#8B5CF6" /> Clientes Frecuentes</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(data.lists?.clientes || []).map((client, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #222', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#8B5CF6', fontWeight: '700' }}>{client.name ? client.name.charAt(0).toUpperCase() : 'C'}</div>
                  <div>
                    <div style={{ color: '#FFF', fontSize: '14px', fontWeight: '600' }}>{client.name || 'Cliente'}</div>
                    <div style={{ color: '#BDBDBD', fontSize: '12px' }}>
                      {client.count} pedidos {client.favoriteProduct ? `• Fav: ${client.favoriteProduct}` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ color: '#FFF', fontWeight: '700', fontSize: '14px' }}>${(client.total || 0).toLocaleString()}</div>
                  <button onClick={() => setSelectedClient(client)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }} title="Ver historial">
                    <Eye size={18} color="#D4A017" />
                  </button>
                </div>
              </div>
            ))}
            {(data.lists?.clientes || []).length === 0 && <div style={{ color: '#666', textAlign: 'center' }}>No hay datos suficientes</div>}
          </div>
        </div>

        <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ color: '#FFF', margin: 0, fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet size={18} color="#22C55E" /> Resumen Financiero</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#BDBDBD', fontSize: '14px' }}>
              <span>Ventas totales</span>
              <span style={{ color: '#FFF', fontWeight: '600' }}>${(data.kpis?.totalVentas || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#BDBDBD', fontSize: '14px' }}>
              <span>Costo prod. vendidos (Compras)</span>
              <span style={{ color: '#EF4444', fontWeight: '600' }}>-${(data.kpis?.totalCompras || 0).toLocaleString()}</span>
            </div>
            <div style={{ height: '1px', backgroundColor: '#333', margin: '8px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#BDBDBD', fontSize: '14px' }}>
              <span style={{ color: '#FFF', fontWeight: '700' }}>Utilidad Bruta</span>
              <span style={{ color: '#22C55E', fontWeight: '800', fontSize: '16px' }}>${(data.kpis?.utilidadBruta || 0).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#BDBDBD', fontSize: '14px', marginTop: '16px' }}>
              <span>Margen de utilidad</span>
              <span style={{ color: '#D4A017', fontWeight: '700' }}>
                {data.kpis?.totalVentas > 0 ? Math.round((data.kpis.utilidadBruta / data.kpis.totalVentas) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      <div>
        <h3 style={{ color: '#FFF', margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Alertas Importantes</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '50%' }}>
                <Package size={24} color="#EF4444" />
              </div>
              <div>
                <div style={{ color: '#FFF', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>3 Productos agotados</div>
                <div style={{ color: '#EF4444', fontSize: '13px' }}>El stock está en 0</div>
              </div>
            </div>
            <button style={{ backgroundColor: '#EF4444', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Ver Inventario</button>
          </div>
          
          <div style={{ flex: 1, backgroundColor: 'rgba(212, 160, 23, 0.1)', border: '1px solid rgba(212, 160, 23, 0.2)', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ backgroundColor: 'rgba(212, 160, 23, 0.2)', padding: '12px', borderRadius: '50%' }}>
                <AlertTriangle size={24} color="#D4A017" />
              </div>
              <div>
                <div style={{ color: '#FFF', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>5 Insumos con stock bajo</div>
                <div style={{ color: '#D4A017', fontSize: '13px' }}>Requieren reabastecimiento pronto</div>
              </div>
            </div>
            <button style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Comprar Insumos</button>
          </div>
        </div>
      </div>

      {/* Modal Historial Cliente */}
      {selectedClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: '#FFF', fontSize: '20px', fontWeight: '800' }}>Historial de {selectedClient.name}</h2>
                <p style={{ margin: '4px 0 0 0', color: '#BDBDBD', fontSize: '14px' }}>Teléfono: {selectedClient.phone || 'N/A'}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#BDBDBD' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(selectedClient.orderHistory || []).map((order, idx) => (
                <div key={idx} style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', padding: '16px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #222' }}>
                    <span style={{ color: '#D4A017', fontWeight: '700', fontSize: '14px' }}>{new Date(order.date).toLocaleString()}</span>
                    <span style={{ color: '#FFF', fontWeight: '800', fontSize: '14px' }}>${(order.total || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(order.cart || []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#BDBDBD', fontSize: '13px' }}>
                        <span>{item.qty || item.quantity || 1}x {item.title}</span>
                        <span>${(item.price * (item.qty || item.quantity || 1)).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(!selectedClient.orderHistory || selectedClient.orderHistory.length === 0) && (
                <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No hay historial detallado</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

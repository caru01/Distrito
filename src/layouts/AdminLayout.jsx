import React, { useEffect, useRef } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, List, Users, Archive, BarChart3, Settings, LogOut, Megaphone } from 'lucide-react';

export default function AdminLayout() {
  const token = sessionStorage.getItem('distrito_admin_token');
  const location = useLocation();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const handleLogout = () => {
    sessionStorage.removeItem('distrito_admin_token');
    window.location.href = '/admin/login';
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Auto logout after 10 min (600000 ms)
      handleLogout();
    }, 600000);
  };

  useEffect(() => {
    if (!token) return;
    
    // Set up listeners for activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);
    
    // Init timer
    resetTimer();
    
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token]);

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Pedidos', path: '/admin/pedidos', icon: <ShoppingBag size={20} /> },
    { name: 'Productos', path: '/admin/productos', icon: <Package size={20} /> },
    { name: 'Categorías', path: '/admin/categorias', icon: <List size={20} /> },
    { name: 'Clientes', path: '/admin/clientes', icon: <Users size={20} /> },
    { name: 'Inventario', path: '/admin/inventario', icon: <Archive size={20} /> },
    { name: 'Reportes', path: '/admin/reportes', icon: <BarChart3 size={20} /> },
    { name: 'Anuncios', path: '/admin/anuncios', icon: <Megaphone size={20} /> },
    { name: 'Configuración', path: '/admin/configuracion', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0D0D0D', color: '#FFFFFF', fontFamily: "'Montserrat', 'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#111111', borderRight: '1px solid #222222', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', fontSize: '20px', fontWeight: '800', borderBottom: '1px solid #222222', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#D4A017', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
            <span style={{ fontWeight: '900', fontSize: '18px' }}>D</span>
          </div>
          Distrito Admin
        </div>
        <nav style={{ flex: 1, padding: '20px 10px' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  color: isActive ? '#000000' : '#BDBDBD',
                  backgroundColor: isActive ? '#D4A017' : 'transparent',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: isActive ? '700' : '500',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid #222222' }}>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: '12px 16px', borderRadius: '12px', fontWeight: '600' }}
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        <Outlet />
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, revenue: 0 });
  
  // Future: Fetch real stats from backend
  
  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 40px 0' }}>Resumen General</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#111111', padding: '24px', borderRadius: '18px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#BDBDBD', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500' }}>Pedidos de Hoy</h3>
          <p style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', margin: 0 }}>0</p>
        </div>
        <div style={{ backgroundColor: '#111111', padding: '24px', borderRadius: '18px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#BDBDBD', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500' }}>Ingresos de Hoy</h3>
          <p style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', margin: 0 }}>$0</p>
        </div>
        <div style={{ backgroundColor: '#111111', padding: '24px', borderRadius: '18px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h3 style={{ color: '#BDBDBD', margin: '0 0 10px 0', fontSize: '14px', fontWeight: '500' }}>Productos Activos</h3>
          <p style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: '700', margin: 0 }}>6</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#111111', padding: '24px', borderRadius: '18px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '700', margin: '0 0 20px 0' }}>Últimos Pedidos</h2>
        <p style={{ color: '#BDBDBD' }}>Próximamente conectaremos esta tabla con la base de datos real...</p>
      </div>
    </div>
  );
}

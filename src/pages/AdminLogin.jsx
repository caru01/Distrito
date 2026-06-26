import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('distrito_admin_token', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#111827', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#1f2937', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>Distrito Admin</h2>
          <p style={{ color: '#9ca3af', marginTop: '5px' }}>Ingresa para gestionar tu tienda</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>Usuario</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white', boxSizing: 'border-box' }}
                placeholder="admin"
                required
              />
            </div>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px', fontSize: '14px' }}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#9ca3af' }} />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#374151', color: 'white', boxSizing: 'border-box' }}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', backgroundColor: '#fbbf24', color: 'black', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Entrando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}

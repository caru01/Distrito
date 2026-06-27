import React, { useState, useEffect } from 'react';
import { 
  Settings, Building2, CreditCard, Bike, Bell, Receipt, 
  ShieldCheck, Printer, Upload, Save, Clock, Phone, 
  Mail, MapPin, DollarSign, Globe, Check
} from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminConfiguracion() {
  const [activeTab, setActiveTab] = useState('Empresa');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [settings, setSettings] = useState({
    restaurant_name: '', description: '', phone: '', email: '', address: '', schedule: '', logo: '',
    prep_time: '', min_order: 0, delivery_cost: 0, max_distance: '', delivery_schedule: '', default_order_type: 'Domicilio',
    payment_efectivo: true, payment_nequi: true, payment_daviplata: true, payment_tarjeta: true, payment_transferencia: false, payment_pse: false,
    instagram: '', facebook: '', tiktok: '', whatsapp_number: '',
    welcome_message: '',
    currency: 'COP', timezone: 'America/Bogota', language: 'es', date_format: 'DD/MM/YYYY', time_format: '12h'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setSettings(prev => ({ ...prev, ...data.settings }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveMessage('✅ Configuraciones guardadas con éxito');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
      setSaveMessage('❌ Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'General', icon: <Settings size={18} /> },
    { id: 'Empresa', icon: <Building2 size={18} /> },
    { id: 'Pagos', icon: <CreditCard size={18} /> },
    { id: 'Domicilios', icon: <Bike size={18} /> },
    { id: 'Notificaciones', icon: <Bell size={18} /> },
    { id: 'Impuestos', icon: <Receipt size={18} /> },
    { id: 'Seguridad', icon: <ShieldCheck size={18} /> },
    { id: 'Impresoras', icon: <Printer size={18} /> }
  ];

  if (loading) return <div style={{ padding: '40px', color: '#FFF' }}>Cargando configuraciones...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%', color: '#FFF' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Dashboard <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#FFFFFF' }}>Configuración</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Configuración</h1>
          <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>Administra todas las configuraciones generales del restaurante de forma centralizada.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {saveMessage && <span style={{ color: saveMessage.includes('✅') ? '#22C55E' : '#EF4444', fontWeight: '600' }}>{saveMessage}</span>}
          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ 
              backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', height: '48px', 
              padding: '0 24px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
            }}
          >
            <Save size={20} /> {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid #222222', marginBottom: '32px', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ 
                background: 'none', border: 'none', borderBottom: isActive ? '3px solid #D4A017' : '3px solid transparent',
                color: isActive ? '#D4A017' : '#BDBDBD',
                padding: '0 0 12px 0', fontSize: '15px', fontWeight: isActive ? '700' : '500', 
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { if(!isActive) e.currentTarget.style.color = '#FFFFFF' }}
              onMouseLeave={(e) => { if(!isActive) e.currentTarget.style.color = '#BDBDBD' }}
            >
              {tab.icon} {tab.id}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div style={{ maxWidth: '900px' }}>
        
        {/* TAB EMPRESA */}
        {activeTab === 'Empresa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Tarjeta 1 */}
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={24} color="#D4A017" /> Información del Restaurante
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Nombre del Restaurante</label>
                  <input type="text" value={settings.restaurant_name} onChange={e => handleChange('restaurant_name', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Teléfono de Contacto</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#6B7280' }} />
                    <input type="text" value={settings.phone} onChange={e => handleChange('phone', e.target.value)} style={{...inputStyle, paddingLeft: '48px'}} />
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Descripción Breve</label>
                  <input type="text" value={settings.description} onChange={e => handleChange('description', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Correo Electrónico</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#6B7280' }} />
                    <input type="text" value={settings.email} onChange={e => handleChange('email', e.target.value)} style={{...inputStyle, paddingLeft: '48px'}} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Horario de Atención</label>
                  <div style={{ position: 'relative' }}>
                    <Clock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#6B7280' }} />
                    <input type="text" value={settings.schedule} onChange={e => handleChange('schedule', e.target.value)} placeholder="Ej. Lunes a Viernes 11:00 AM - 10:00 PM" style={{...inputStyle, paddingLeft: '48px'}} />
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Dirección Principal</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: '#6B7280' }} />
                    <input type="text" value={settings.address} onChange={e => handleChange('address', e.target.value)} style={{...inputStyle, paddingLeft: '48px'}} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #222222', paddingTop: '24px' }}>
                <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '16px' }}>Logotipo del Restaurante</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                  {settings.logo ? (
                    <img src={settings.logo} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', border: '1px solid #2A2A2A', backgroundColor: '#000' }} />
                  ) : (
                    <div style={{ width: '80px', height: '80px', backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px dashed #333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 color="#666" />
                    </div>
                  )}
                  <div style={{ flex: 1, border: '1px dashed #333333', borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)', cursor: 'pointer' }}>
                    <Upload size={24} color="#D4A017" style={{ marginBottom: '8px' }} />
                    <div style={{ fontWeight: '600' }}>Subir nuevo logo</div>
                    <div style={{ fontSize: '13px', color: '#BDBDBD', marginTop: '4px' }}>Arrastra una imagen o pega la URL en el campo de texto</div>
                    <input type="text" value={settings.logo} onChange={e => handleChange('logo', e.target.value)} placeholder="URL del logotipo (https://...)" style={{ ...inputStyle, marginTop: '16px', padding: '8px 12px' }} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tarjeta 4 - Redes Sociales */}
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={24} color="#D4A017" /> Redes Sociales y Enlaces
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>WhatsApp (Número con indicativo ej. 57300...)</label>
                  <input type="text" value={settings.whatsapp_number} onChange={e => handleChange('whatsapp_number', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Instagram (URL)</label>
                  <input type="text" value={settings.instagram} onChange={e => handleChange('instagram', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Facebook (URL)</label>
                  <input type="text" value={settings.facebook} onChange={e => handleChange('facebook', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>TikTok (URL)</label>
                  <input type="text" value={settings.tiktok} onChange={e => handleChange('tiktok', e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB DOMICILIOS Y PEDIDOS */}
        {activeTab === 'Domicilios' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bike size={24} color="#D4A017" /> Configuración Operativa
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Tiempo estimado de preparación</label>
                  <input type="text" value={settings.prep_time} onChange={e => handleChange('prep_time', e.target.value)} placeholder="Ej. 20-30 min" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Costo del domicilio ($)</label>
                  <input type="number" value={settings.delivery_cost} onChange={e => handleChange('delivery_cost', parseInt(e.target.value)||0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Pedido Mínimo ($)</label>
                  <input type="number" value={settings.min_order} onChange={e => handleChange('min_order', parseInt(e.target.value)||0)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Distancia Máxima</label>
                  <input type="text" value={settings.max_distance} onChange={e => handleChange('max_distance', e.target.value)} placeholder="Ej. 5 km" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Tipo de pedido predeterminado</label>
                  <select value={settings.default_order_type} onChange={e => handleChange('default_order_type', e.target.value)} style={inputStyle}>
                    <option value="Domicilio">Domicilio</option>
                    <option value="Para Llevar">Para Llevar</option>
                    <option value="Local">Consumir en el Local</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Horario de Domicilios</label>
                  <input type="text" value={settings.delivery_schedule} onChange={e => handleChange('delivery_schedule', e.target.value)} placeholder="Ej. 11:30 AM a 9:30 PM" style={inputStyle} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB PAGOS */}
        {activeTab === 'Pagos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={24} color="#D4A017" /> Métodos de Pago Activos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <PaymentRow name="Efectivo" field="payment_efectivo" settings={settings} onChange={handleChange} />
                <PaymentRow name="Nequi" field="payment_nequi" settings={settings} onChange={handleChange} />
                <PaymentRow name="Daviplata" field="payment_daviplata" settings={settings} onChange={handleChange} />
                <PaymentRow name="Tarjeta Crédito / Débito (Datáfono)" field="payment_tarjeta" settings={settings} onChange={handleChange} />
                <PaymentRow name="Transferencia Bancaria" field="payment_transferencia" settings={settings} onChange={handleChange} />
                <PaymentRow name="PSE" field="payment_pse" settings={settings} onChange={handleChange} />
              </div>
            </div>
          </div>
        )}

        {/* TAB GENERAL */}
        {activeTab === 'General' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={24} color="#D4A017" /> Mensaje de Bienvenida
              </h2>
              <textarea 
                value={settings.welcome_message} 
                onChange={e => handleChange('welcome_message', e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                placeholder="Bienvenido a Distrito BG. Disfruta nuestras hamburguesas..."
              />
            </div>
            
            <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={24} color="#D4A017" /> Configuración del Sistema
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Moneda Principal</label>
                  <select value={settings.currency} onChange={e => handleChange('currency', e.target.value)} style={inputStyle}>
                    <option value="COP">COP ($) - Pesos Colombianos</option>
                    <option value="USD">USD ($) - Dólares</option>
                    <option value="EUR">EUR (€) - Euros</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Idioma</label>
                  <select value={settings.language} onChange={e => handleChange('language', e.target.value)} style={inputStyle}>
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Zona Horaria</label>
                  <select value={settings.timezone} onChange={e => handleChange('timezone', e.target.value)} style={inputStyle}>
                    <option value="America/Bogota">America/Bogota (UTC -5)</option>
                    <option value="America/Mexico_City">America/Mexico_City</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#BDBDBD', fontSize: '14px', marginBottom: '8px' }}>Formato de Hora</label>
                  <select value={settings.time_format} onChange={e => handleChange('time_format', e.target.value)} style={inputStyle}>
                    <option value="12h">12 Horas (AM/PM)</option>
                    <option value="24h">24 Horas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS PLACEHOLDERS (EN CONSTRUCCIÓN) */}
        {['Notificaciones', 'Impuestos', 'Seguridad', 'Impresoras'].includes(activeTab) && (
          <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px dashed #333', padding: '60px', textAlign: 'center' }}>
            <Settings size={48} color="#333" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#FFF' }}>{activeTab}</h2>
            <p style={{ color: '#BDBDBD', fontSize: '16px' }}>Esta sección estará disponible en la próxima actualización.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// Componentes Auxiliares

const inputStyle = {
  width: '100%', 
  backgroundColor: '#1A1A1A', 
  border: '1px solid #2A2A2A', 
  borderRadius: '12px', 
  padding: '14px 16px', 
  color: '#FFFFFF', 
  fontSize: '15px', 
  outline: 'none', 
  boxSizing: 'border-box'
};

const PaymentRow = ({ name, field, settings, onChange }) => {
  const isActive = settings[field];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1A1A1A', padding: '16px 20px', borderRadius: '12px', border: '1px solid #2A2A2A' }}>
      <div style={{ color: '#FFF', fontWeight: '500', fontSize: '15px' }}>{name}</div>
      <button 
        onClick={() => onChange(field, !isActive)}
        style={{ 
          width: '50px', height: '28px', borderRadius: '999px', border: 'none', cursor: 'pointer', position: 'relative',
          backgroundColor: isActive ? '#D4A017' : '#333333', transition: 'background-color 0.2s'
        }}
      >
        <div style={{ 
          position: 'absolute', top: '4px', left: isActive ? '26px' : '4px', 
          width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FFF',
          transition: 'left 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isActive && <Check size={12} color="#000" />}
        </div>
      </button>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Megaphone, Save, Image as ImageIcon, CheckCircle, XCircle, Bell, Send } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminAnuncios() {
  const [announcement, setAnnouncement] = useState({
    title: '',
    image_url: '',
    is_active: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Push State
  const [pushData, setPushData] = useState({ title: '', message: '', url: '/' });
  const [sendingPush, setSendingPush] = useState(false);
  const [pushMessage, setPushMessage] = useState('');

  useEffect(() => {
    fetchAnnouncement();
  }, []);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`${API_URL}/announcement`);
      const data = await res.json();
      if (data.status === 'ok' && data.announcement) {
        setAnnouncement({
          title: data.announcement.title || '',
          image_url: data.announcement.image_url || '',
          is_active: data.announcement.is_active || false
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage('Error: La imagen es muy pesada (máximo 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnouncement({ ...announcement, image_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/announcement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcement)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setMessage('Anuncio guardado exitosamente');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error al guardar el anuncio');
      }
    } catch (err) {
      setMessage('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPush = async () => {
    if (!pushData.title || !pushData.message) return setPushMessage('Error: Título y mensaje requeridos');
    setSendingPush(true);
    setPushMessage('');
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(pushData)
      });
      const data = await res.json();
      if (res.ok) {
        setPushMessage(`¡Notificación enviada a ${data.sent} clientes!`);
        setPushData({ title: '', message: '', url: '/' });
      } else {
        setPushMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setPushMessage('Error de conexión al enviar Push');
    }
    setSendingPush(false);
  };

  if (loading) return <div style={{ padding: '40px', color: '#FFF' }}>Cargando...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Megaphone size={36} color="#D4A017" /> Configuración de Anuncio
        </h1>
        <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>
          Administra el anuncio emergente (pop-up) que ven los clientes al entrar a la tienda.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Formulario */}
        <div style={{ backgroundColor: '#111111', borderRadius: '20px', padding: '30px', border: '1px solid #222222' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Título del Anuncio</label>
            <input 
              type="text" 
              value={announcement.title}
              onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
              placeholder="Ej: ¡Gran Promoción de Fin de Semana!"
              style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', padding: '16px', color: '#FFFFFF', fontSize: '15px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>URL de la Imagen</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#6B7280' }} />
              <input 
                type="text" 
                value={announcement.image_url}
                onChange={(e) => setAnnouncement({...announcement, image_url: e.target.value})}
                placeholder="https://ejemplo.com/imagen.jpg"
                style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', padding: '16px 16px 16px 48px', color: '#FFFFFF', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '8px', marginBottom: '16px' }}>Pega el enlace directo a la imagen. Recomendado formato cuadrado o vertical.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
              <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '500' }}>O Sube desde tu PC</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#333' }}></div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', backgroundColor: '#1A1A1A', border: '1px dashed #4A4A4A', borderRadius: '12px', color: '#BDBDBD', cursor: 'pointer', boxSizing: 'border-box', transition: 'all 0.2s' }}>
                <ImageIcon size={20} />
                <span>Seleccionar Imagen (Máx 5MB)</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #333333' }}>
            <div 
              onClick={() => setAnnouncement({...announcement, is_active: !announcement.is_active})}
              style={{ 
                width: '50px', height: '28px', backgroundColor: announcement.is_active ? '#D4A017' : '#333333', 
                borderRadius: '999px', position: 'relative', cursor: 'pointer', transition: '0.3s'
              }}
            >
              <div style={{ 
                width: '24px', height: '24px', backgroundColor: '#FFF', borderRadius: '50%', 
                position: 'absolute', top: '2px', left: announcement.is_active ? '24px' : '2px', transition: '0.3s' 
              }} />
            </div>
            <div>
              <div style={{ color: '#FFF', fontWeight: '600' }}>Activar Anuncio</div>
              <div style={{ color: '#BDBDBD', fontSize: '13px' }}>{announcement.is_active ? 'El anuncio es visible para todos.' : 'El anuncio está oculto actualmente.'}</div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            style={{ 
              width: '100%', backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', 
              padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
            }}
          >
            <Save size={20} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>

          {message && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: message.includes('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: message.includes('Error') ? '#EF4444' : '#4ADE80', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
              {message}
            </div>
          )}
        </div>

        {/* Vista Previa */}
        <div>
          <h3 style={{ color: '#FFFFFF', marginTop: '0', marginBottom: '20px', fontSize: '20px' }}>Vista Previa</h3>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '20px', padding: '40px', border: '1px solid #222222', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', position: 'relative' 
          }}>
            <div style={{ 
              backgroundColor: '#111111', width: '100%', maxWidth: '350px', borderRadius: '24px', overflow: 'hidden', 
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)', border: '1px solid #333333'
            }}>
              {announcement.image_url ? (
                <img src={announcement.image_url} alt="Anuncio" style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'contain', backgroundColor: '#000' }} onError={(e) => e.target.src = 'https://via.placeholder.com/400x400?text=Imagen+Invalida'} />
              ) : (
                <div style={{ width: '100%', height: '350px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>
                  <ImageIcon size={48} />
                </div>
              )}
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#FFFFFF', fontSize: '22px', fontWeight: '800' }}>
                  {announcement.title || 'Título del anuncio'}
                </h3>
                <button style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', borderRadius: '12px', padding: '12px 24px', fontWeight: '700', fontSize: '15px', width: '100%' }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notificaciones Push */}
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
        <div style={{ backgroundColor: '#111111', borderRadius: '20px', padding: '30px', border: '1px solid #222222' }}>
          <h2 style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={28} color="#D4A017" /> Enviar Notificación Push (A Celulares)
          </h2>
          <p style={{ color: '#BDBDBD', fontSize: '15px', marginBottom: '24px' }}>
            Envía un mensaje directo a todos los clientes que hayan aceptado recibir notificaciones e instalado la App.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Título</label>
              <input 
                type="text" 
                value={pushData.title}
                onChange={(e) => setPushData({...pushData, title: e.target.value})}
                placeholder="Ej: ¡Promo 2x1!"
                style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', padding: '14px', color: '#FFFFFF', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Mensaje</label>
              <input 
                type="text" 
                value={pushData.message}
                onChange={(e) => setPushData({...pushData, message: e.target.value})}
                placeholder="Ej: Pide hoy y el envío es gratis."
                style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', borderRadius: '12px', padding: '14px', color: '#FFFFFF', fontSize: '15px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <button 
            onClick={handleSendPush}
            disabled={sendingPush}
            style={{ 
              width: '100%', backgroundColor: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '12px', 
              padding: '16px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px' 
            }}
          >
            <Send size={20} /> {sendingPush ? 'Enviando...' : 'Enviar Notificación a Todos'}
          </button>

          {pushMessage && (
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: pushMessage.includes('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: pushMessage.includes('Error') ? '#EF4444' : '#4ADE80', borderRadius: '8px', textAlign: 'center', fontWeight: '500' }}>
              {pushMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

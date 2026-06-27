import React, { useState, useEffect } from 'react';
import { Folder, Plus, Search, Package, BadgeCheck, Pencil, Trash2, ChevronLeft, ChevronRight, X, Utensils } from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

// Gran variedad de Emojis modernos para gastronomía
const EMOJI_OPTIONS = [
  '🍔', '🍕', '🌭', '🥪', '🌮', '🌯', '🥙', '🧆', '🍟', '🥩', '🍗', '🍖', '🥓', 
  '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤', '🍙', '🍚', '🍘', '🍥', 
  '🥠', '🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧇', '🧀', '🥗', '🥣', '🥚', 
  '🍳', '🍿', '🧂', '🥫', '🍄', '🥜', '🌰', '🥑', '🍆', '🥔', '🥕', '🌽', 
  '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍅', '🍓', '🍒', '🍎', '🍉', 
  '🍑', '🍊', '🍍', '🍌', '🍋', '🍈', '🍏', '🍐', '🥝', '🥭', '🥥', '🍇', 
  '🫐', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍩', '🍪', '🍨', '🍧', 
  '🍦', '🥧', '🥤', '🧋', '🧃', '🧉', '🥛', '☕', '🍵', '🍶', '🍾', '🍷', 
  '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🧊', '🍽️', '🍴', '🥄', '🥢', '🥡', '🔥', '⭐', '✨'
];

export default function AdminCategorias() {
  const [hoverNewBtn, setHoverNewBtn] = useState(false);
  const [hoverEdit, setHoverEdit] = useState(null);
  const [hoverDelete, setHoverDelete] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', description: '', image: 'Utensils', status: 'Activa' });

  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/admin/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCategory({ ...cat, image: cat.image || 'Utensils' });
    } else {
      setCurrentCategory({ id: null, name: '', description: '', image: 'Utensils', status: 'Activa' });
    }
    setShowIconPicker(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('distrito_admin_token');
    const method = currentCategory.id ? 'PUT' : 'POST';
    const url = currentCategory.id 
      ? `${API_URL}/admin/categories/${currentCategory.id}` 
      : `${API_URL}/admin/categories`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(currentCategory)
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        alert(data.error || 'Error guardando categoría');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    const token = sessionStorage.getItem('distrito_admin_token');
    try {
      const res = await fetch(`${API_URL}/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        fetchCategories();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayCategories = categories.length > 0 ? categories : [];
  const activeCategories = displayCategories.filter(c => c.status === 'Activa').length;

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      
      {/* Navegación y Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Dashboard <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#FFFFFF' }}>Categorías</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Categorías</h1>
          <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>Administra todas las categorías de tu menú desde este módulo.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          onMouseEnter={() => setHoverNewBtn(true)}
          onMouseLeave={() => setHoverNewBtn(false)}
          style={{ 
            backgroundColor: hoverNewBtn ? '#F5C542' : '#D4A017', 
            color: '#000000', 
            border: 'none', 
            borderRadius: '12px', 
            height: '48px', 
            padding: '0 24px', 
            fontSize: '16px', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <Plus size={20} />
          Nueva categoría
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div style={{ backgroundColor: '#111111', borderRadius: '18px', padding: '24px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{displayCategories.length}</div>
            <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>Total de categorías</div>
          </div>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(212, 160, 23, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}>
            <Package size={28} />
          </div>
        </div>

        <div style={{ backgroundColor: '#111111', borderRadius: '18px', padding: '24px', border: '1px solid #222222', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>{activeCategories}</div>
            <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>Categorías activas</div>
          </div>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
            <BadgeCheck size={28} />
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#6B7280' }} />
          <input 
            type="text" 
            placeholder="Buscar categoría..." 
            style={{ 
              width: '100%', 
              backgroundColor: '#111111', 
              border: '1px solid #2A2A2A', 
              borderRadius: '12px', 
              padding: '16px 16px 16px 48px', 
              color: '#FFFFFF', 
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }} 
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#111111', borderRadius: '18px', border: '1px solid #222222', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #222222' }}>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', width: '80px' }}>Icono</th>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Categoría</th>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Descripción</th>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>Productos</th>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Estado</th>
              <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {displayCategories.map((cat, index) => (
              <tr key={cat.id} style={{ borderBottom: index === displayCategories.length - 1 ? 'none' : '1px solid #222222' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #333333' }}>
                    {cat.image || '🍔'}
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>{cat.name}</td>
                <td style={{ padding: '16px 24px', color: '#BDBDBD', fontSize: '14px' }}>{cat.description || cat.desc}</td>
                <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '600', fontSize: '15px', textAlign: 'center' }}>{cat.products || 0}</td>
                <td style={{ padding: '16px 24px' }}>
                  {cat.status === 'Activa' ? (
                    <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#4ADE80', padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
                      Activa
                    </span>
                  ) : (
                    <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#F87171', padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: '600' }}>
                      Inactiva
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => handleOpenModal(cat)}
                      onMouseEnter={() => setHoverEdit(cat.id)}
                      onMouseLeave={() => setHoverEdit(null)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: hoverEdit === cat.id ? 'translateY(-2px)' : 'none',
                        boxShadow: hoverEdit === cat.id ? '0 4px 12px rgba(0,0,0,0.5)' : 'none'
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      onMouseEnter={() => setHoverDelete(cat.id)}
                      onMouseLeave={() => setHoverDelete(null)}
                      style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: hoverDelete === cat.id ? 'translateY(-2px)' : 'none',
                        boxShadow: hoverDelete === cat.id ? '0 4px 12px rgba(239,68,68,0.2)' : 'none'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {displayCategories.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#BDBDBD' }}>
                  No hay categorías registradas. ¡Haz clic en "Nueva categoría" para empezar!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111111', padding: '30px', borderRadius: '18px', width: '100%', maxWidth: '500px', border: '1px solid #222222', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '24px' }}>{currentCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px' }}>Icono y Nombre</label>
                <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                  
                  {/* Botón Selector de Icono */}
                  <button 
                    type="button"
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    style={{ 
                      width: '48px', height: '48px', flexShrink: 0, backgroundColor: '#1A1A1A', border: '1px solid #333333', 
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', cursor: 'pointer'
                    }}
                  >
                    {currentCategory.image || '🍔'}
                  </button>

                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Hamburguesas"
                    value={currentCategory.name}
                    onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})}
                    style={{ flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '12px', borderRadius: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                  />

                  {/* Dropdown de Iconos */}
                  {showIconPicker && (
                    <div style={{ 
                      position: 'absolute', top: '56px', left: 0, backgroundColor: '#1A1A1A', border: '1px solid #333333', 
                      borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px',
                      zIndex: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', width: '400px', maxHeight: '300px', overflowY: 'auto'
                    }}>
                      {EMOJI_OPTIONS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setCurrentCategory({...currentCategory, image: emoji});
                            setShowIconPicker(false);
                          }}
                          style={{
                            width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: currentCategory.image === emoji ? '#D4A017' : 'transparent',
                            fontSize: '20px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px' }}>Descripción</label>
                <textarea 
                  value={currentCategory.description}
                  onChange={e => setCurrentCategory({...currentCategory, description: e.target.value})}
                  style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '12px', borderRadius: '8px', color: '#FFFFFF', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px' }}>Estado</label>
                <select 
                  value={currentCategory.status}
                  onChange={e => setCurrentCategory({...currentCategory, status: e.target.value})}
                  style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '12px', borderRadius: '8px', color: '#FFFFFF', boxSizing: 'border-box' }}
                >
                  <option value="Activa">Activa</option>
                  <option value="Inactiva">Inactiva</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '12px 24px', backgroundColor: '#1A1A1A', color: '#FFFFFF', border: '1px solid #333333', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

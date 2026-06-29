import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Scale, Calculator, ArrowRight, DollarSign, ShoppingCart } from 'lucide-react';

export default function AdminRendimientos() {
  const [rendimientos, setRendimientos] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    ingrediente_id: '',
    ingrediente_name: '',
    unidad_compra: 'Kilogramos',
    cantidad_comprada: '',
    costo_compra: '',
    unidad_consumo: 'Gramos',
    rendimiento_obtenido: ''
  });

  const [newIngredientName, setNewIngredientName] = useState('');
  const [showNewIngredientInput, setShowNewIngredientInput] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const [resRendimientos, resInventory] = await Promise.all([
        fetch(`${API_URL}/api/pedidos/admin/rendimientos`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/pedidos/admin/inventory`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const jsonR = await resRendimientos.json();
      const jsonI = await resInventory.json();
      
      if (jsonR.status === 'ok') setRendimientos(jsonR.data || []);
      if (jsonI.status === 'ok') setInventory(jsonI.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIngredient = async () => {
    if (!newIngredientName.trim()) return;
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/api/pedidos/admin/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newIngredientName })
      });
      const json = await res.json();
      if (json.status === 'ok') {
        setInventory([...inventory, json.data]);
        setFormData({ ...formData, ingrediente_id: json.data.id, ingrediente_name: json.data.name });
        setNewIngredientName('');
        setShowNewIngredientInput(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      const res = await fetch(`${API_URL}/api/pedidos/admin/rendimientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (json.status === 'ok') {
        setIsModalOpen(false);
        fetchData(); // Reload table
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('¿Eliminar este rendimiento?')) return;
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      await fetch(`${API_URL}/api/pedidos/admin/rendimientos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const calculatedCost = (formData.costo_compra > 0 && formData.rendimiento_obtenido > 0) 
    ? (formData.costo_compra / formData.rendimiento_obtenido).toFixed(2)
    : 0;

  if (loading) return <div style={{ color: '#FFF', padding: '40px' }}>Cargando módulo de rendimientos...</div>;

  return (
    <div style={{ backgroundColor: '#0D0D0D', minHeight: '100vh', padding: '40px', fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '13px', marginBottom: '8px' }}>
            Dashboard &gt; <span style={{ color: '#FFF' }}>Rendimientos</span>
          </div>
          <h1 style={{ color: '#FFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Scale size={32} color="#D4A017" />
            Rendimientos
          </h1>
          <p style={{ color: '#BDBDBD', margin: 0, fontSize: '14px', maxWidth: '600px' }}>
            Configura cómo se consume cada ingrediente comprado para calcular automáticamente los costos de producción y descontar el inventario.
          </p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              ingrediente_id: '', ingrediente_name: '', unidad_compra: 'Kilogramos', 
              cantidad_comprada: '', costo_compra: '', unidad_consumo: 'Gramos', rendimiento_obtenido: ''
            });
            setIsModalOpen(true);
          }}
          style={{ display: 'flex', alignItems: 'center', backgroundColor: '#D4A017', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', gap: '8px', cursor: 'pointer' }}
        >
          <Plus size={20} />
          Nuevo Rendimiento
        </button>
      </div>

      {/* Tabla Principal */}
      <div style={{ backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#FFF' }}>
          <thead>
            <tr style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #222' }}>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD' }}>Ingrediente</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD' }}>Compra</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD' }}>Rendimiento</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD' }}>Costo Unidad</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD' }}>Estado</th>
              <th style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: '#BDBDBD', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rendimientos.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '16px', fontWeight: '600' }}>{r.ingrediente_name}</td>
                <td style={{ padding: '16px', color: '#BDBDBD', fontSize: '14px' }}>
                  {r.cantidad_comprada} {r.unidad_compra}
                  <div style={{ fontSize: '12px', color: '#666' }}>${Number(r.costo_compra).toLocaleString()}</div>
                </td>
                <td style={{ padding: '16px', color: '#BDBDBD', fontSize: '14px' }}>
                  {r.rendimiento_obtenido} {r.unidad_consumo}
                </td>
                <td style={{ padding: '16px', color: '#D4A017', fontWeight: '700' }}>
                  ${Number(r.costo_por_unidad).toLocaleString()} <span style={{color: '#666', fontWeight: '500', fontSize: '12px'}}>/ {r.unidad_consumo.toLowerCase()}</span>
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{ backgroundColor: r.estado === 'Activo' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: r.estado === 'Activo' ? '#22C55E' : '#EF4444', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                    {r.estado}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#BDBDBD', cursor: 'pointer', padding: '4px 8px' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(r.id)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px 8px' }}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {rendimientos.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#666' }}>No hay rendimientos configurados. Presiona "Nuevo Rendimiento".</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nuevo Rendimiento */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px', width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #222' }}>
              <h2 style={{ margin: 0, color: '#FFF', fontSize: '24px', fontWeight: '800' }}>Nuevo Rendimiento</h2>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Sección Ingrediente */}
              <div>
                <label style={{ display: 'block', color: '#FFF', marginBottom: '8px', fontWeight: '600' }}>Seleccionar Ingrediente</label>
                {!showNewIngredientInput ? (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select 
                      value={formData.ingrediente_id}
                      onChange={(e) => {
                        const ing = inventory.find(i => i.id === parseInt(e.target.value));
                        setFormData({...formData, ingrediente_id: e.target.value, ingrediente_name: ing ? ing.name : ''});
                      }}
                      required
                      style={{ flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #333', color: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '15px' }}
                    >
                      <option value="">-- Selecciona del Inventario --</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowNewIngredientInput(true)} style={{ backgroundColor: '#333', color: '#FFF', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Nuevo</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input 
                      type="text" 
                      value={newIngredientName}
                      onChange={(e) => setNewIngredientName(e.target.value)}
                      placeholder="Nombre del nuevo ingrediente..."
                      style={{ flex: 1, backgroundColor: '#1A1A1A', border: '1px solid #333', color: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '15px' }}
                    />
                    <button type="button" onClick={handleCreateIngredient} style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>Crear</button>
                    <button type="button" onClick={() => setShowNewIngredientInput(false)} style={{ backgroundColor: '#333', color: '#FFF', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                  </div>
                )}
              </div>

              {/* Flex Grid 2 columnas */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                
                {/* Columna Izquierda: COMPRA */}
                <div style={{ backgroundColor: '#1A1A1A', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#D4A017', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart size={18} /> Datos de Compra
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Unidad de compra</label>
                      <select value={formData.unidad_compra} onChange={e => setFormData({...formData, unidad_compra: e.target.value})} style={{ width: '100%', backgroundColor: '#0D0D0D', border: '1px solid #333', color: '#FFF', padding: '10px', borderRadius: '6px' }}>
                        <option>Kilogramos</option><option>Gramos</option><option>Libras</option>
                        <option>Litros</option><option>Galón</option>
                        <option>Unidad</option><option>Caja</option><option>Bolsa</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Cant. comprada</label>
                      <input type="number" required value={formData.cantidad_comprada} onChange={e => setFormData({...formData, cantidad_comprada: e.target.value})} placeholder="Ej: 10" style={{ width: '100%', backgroundColor: '#0D0D0D', border: '1px solid #333', color: '#FFF', padding: '10px', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Costo total de la compra ($)</label>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#0D0D0D', border: '1px solid #333', borderRadius: '6px', padding: '0 10px' }}>
                      <DollarSign size={16} color="#666" />
                      <input type="number" required value={formData.costo_compra} onChange={e => setFormData({...formData, costo_compra: e.target.value})} placeholder="Ej: 380000" style={{ width: '100%', backgroundColor: 'transparent', border: 'none', color: '#FFF', padding: '10px', outline: 'none' }} />
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: CONSUMO */}
                <div style={{ backgroundColor: '#1A1A1A', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#22C55E', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Scale size={18} /> Datos de Consumo
                  </h3>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Unidad de consumo</label>
                      <select value={formData.unidad_consumo} onChange={e => setFormData({...formData, unidad_consumo: e.target.value})} style={{ width: '100%', backgroundColor: '#0D0D0D', border: '1px solid #333', color: '#FFF', padding: '10px', borderRadius: '6px' }}>
                        <option>Gramos</option><option>Mililitros</option><option>Unidad</option>
                        <option>Tajada</option><option>Torreja</option><option>Rebanada</option>
                        <option>Porción</option><option>Cucharada</option><option>Onza</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Rendimiento final</label>
                      <input type="number" required value={formData.rendimiento_obtenido} onChange={e => setFormData({...formData, rendimiento_obtenido: e.target.value})} placeholder="Ej: 10000" style={{ width: '100%', backgroundColor: '#0D0D0D', border: '1px solid #333', color: '#FFF', padding: '10px', borderRadius: '6px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#BDBDBD', fontSize: '13px', marginBottom: '4px' }}>Costo por {formData.unidad_consumo.toLowerCase()} (Automático)</label>
                    <div style={{ backgroundColor: '#0D0D0D', border: '1px solid #D4A017', borderRadius: '6px', padding: '10px', color: '#D4A017', fontWeight: '800', fontSize: '18px', textAlign: 'center' }}>
                      ${calculatedCost}
                    </div>
                  </div>
                </div>

              </div>

              {/* Vista Previa */}
              <div style={{ backgroundColor: 'rgba(212, 160, 23, 0.05)', border: '1px dashed #D4A017', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#D4A017', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Vista Previa Automática</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFF' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#BDBDBD' }}>Si compro</div>
                    <div style={{ fontWeight: '700' }}>{formData.cantidad_comprada || 0} {formData.unidad_compra} de {formData.ingrediente_name || '...'}</div>
                    <div style={{ fontSize: '12px', color: '#EF4444' }}>por ${Number(formData.costo_compra || 0).toLocaleString()}</div>
                  </div>
                  <ArrowRight color="#D4A017" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#BDBDBD' }}>Obtengo</div>
                    <div style={{ fontWeight: '700' }}>{formData.rendimiento_obtenido || 0} {formData.unidad_consumo}</div>
                  </div>
                  <ArrowRight color="#D4A017" />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#BDBDBD' }}>El costo real es de</div>
                    <div style={{ fontWeight: '800', color: '#22C55E', fontSize: '18px' }}>${calculatedCost}</div>
                    <div style={{ fontSize: '12px', color: '#BDBDBD' }}>por {formData.unidad_consumo.toLowerCase()}</div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: 'transparent', color: '#BDBDBD', border: '1px solid #333', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={!formData.ingrediente_id} style={{ backgroundColor: '#D4A017', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', opacity: formData.ingrediente_id ? 1 : 0.5 }}>
                  Guardar Rendimiento
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

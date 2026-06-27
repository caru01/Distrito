import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Tag, DollarSign, Star, Boxes, 
  Image as ImageIcon, Eye, Pencil, Copy, Trash2, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const API_URL = import.meta.env.PROD ? '/api/pedidos' : 'http://localhost:3001/api/pedidos';

export default function AdminProductos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null, title: '', description: '', price: '', category: '', 
    image: '', status: 'Activo', is_featured: false, stock: ''
  });

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('distrito_admin_token');
      // Fetch Products
      const resP = await fetch(`${API_URL}/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataP = await resP.json();
      if (dataP.status === 'ok') setProducts(dataP.products);

      // Fetch Categories for the dropdown
      const resC = await fetch(`${API_URL}/admin/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
      const dataC = await resC.json();
      if (dataC.status === 'ok') setCategories(dataC.categories);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (prod = null, isDuplicate = false) => {
    if (prod) {
      if (isDuplicate) {
        setCurrentProduct({ ...prod, id: null, title: `${prod.title} (Copia)` });
      } else {
        setCurrentProduct(prod);
      }
    } else {
      setCurrentProduct({ id: null, title: '', description: '', price: '', category: '', image: '', status: 'Activo', is_featured: false, stock: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentProduct.title || !currentProduct.price) {
      return alert('Por favor, ingresa el nombre y el precio del producto.');
    }

    const token = sessionStorage.getItem('distrito_admin_token');
    const method = currentProduct.id ? 'PUT' : 'POST';
    const url = currentProduct.id ? `${API_URL}/admin/products/${currentProduct.id}` : `${API_URL}/admin/products`;

    try {
      const payload = {
        ...currentProduct,
        price: parseInt(currentProduct.price) || 0,
        stock: currentProduct.stock ? parseInt(currentProduct.stock) : null
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Error del servidor:', errData);
        alert(`Error al guardar producto: ${errData.error || res.statusText || 'Verifica que la imagen no sea muy pesada.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión guardando el producto. Verifica tu servidor.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    const token = sessionStorage.getItem('distrito_admin_token');
    try {
      await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (prod) => {
    const newStatus = prod.status === 'Activo' ? 'Inactivo' : 'Activo';
    const token = sessionStorage.getItem('distrito_admin_token');
    try {
      await fetch(`${API_URL}/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...prod, status: newStatus })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const toggleFeatured = async (prod) => {
    const token = sessionStorage.getItem('distrito_admin_token');
    try {
      await fetch(`${API_URL}/admin/products/${prod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...prod, is_featured: !prod.is_featured })
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredProducts = products
    .filter(p => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterFeatured === 'Destacado' && !p.is_featured) return false;
      if (filterFeatured === 'No Destacado' && p.is_featured) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'nombre_asc') return a.title.localeCompare(b.title);
      if (sortBy === 'nombre_desc') return b.title.localeCompare(a.title);
      if (sortBy === 'precio_asc') return a.price - b.price;
      if (sortBy === 'precio_desc') return b.price - a.price;
      return 0; // Default order
    });

  const statActivos = products.filter(p => p.status === 'Activo').length;
  const statInactivos = products.filter(p => p.status !== 'Activo').length;
  const statDestacados = products.filter(p => p.is_featured).length;

  return (
    <div style={{ padding: '40px', fontFamily: "'Montserrat', 'Poppins', sans-serif", backgroundColor: '#0D0D0D', minHeight: '100%' }}>
      
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <div style={{ color: '#BDBDBD', fontSize: '14px', marginBottom: '8px', fontWeight: '500' }}>
            Dashboard <span style={{ margin: '0 8px' }}>/</span> <span style={{ color: '#FFFFFF' }}>Productos</span>
          </div>
          <h1 style={{ color: '#FFFFFF', fontSize: '36px', fontWeight: '800', margin: '0 0 8px 0' }}>Productos</h1>
          <p style={{ color: '#BDBDBD', fontSize: '16px', margin: 0 }}>Administra todos los productos disponibles en tu menú.</p>
        </div>
        
        <button 
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '12px', height: '48px', padding: '0 24px', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'background-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F5C542'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#D4A017'}
        >
          <Plus size={20} /> Nuevo Producto
        </button>
      </div>

      {/* Tarjetas Estadísticas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {[
          { label: 'Total de productos', value: products.length, icon: <Package size={28} /> },
          { label: 'Productos activos', value: statActivos, icon: <Package size={28} /> },
          { label: 'Productos inactivos', value: statInactivos, icon: <Package size={28} /> },
          { label: 'Productos destacados', value: statDestacados, icon: <Star size={28} /> }
        ].map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#111111', borderRadius: '20px', padding: '24px', border: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <div>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>{stat.label}</div>
            </div>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(212, 160, 23, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A017' }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: '#6B7280' }} />
          <input 
            type="text" 
            placeholder="Buscar producto..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', height: '52px', backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 16px 0 48px', color: '#FFFFFF', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
        
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 16px', color: '#FFFFFF', fontSize: '14px', height: '52px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 16px', color: '#FFFFFF', fontSize: '14px', height: '52px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>

        <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)} style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 16px', color: '#FFFFFF', fontSize: '14px', height: '52px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Cualquier destaque</option>
          <option value="Destacado">Destacados</option>
          <option value="No Destacado">No destacados</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ backgroundColor: '#111111', border: '1px solid #2A2A2A', borderRadius: '12px', padding: '0 16px', color: '#FFFFFF', fontSize: '14px', height: '52px', outline: 'none', cursor: 'pointer' }}>
          <option value="">Ordenar por (Defecto)</option>
          <option value="nombre_asc">Nombre (A-Z)</option>
          <option value="nombre_desc">Nombre (Z-A)</option>
          <option value="precio_asc">Precio (Menor a Mayor)</option>
          <option value="precio_desc">Precio (Mayor a Menor)</option>
        </select>
      </div>

      {/* Tabla */}
      <div style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid #222222', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #222222' }}>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', width: '80px' }}>Imagen</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Producto</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Categoría</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Precio</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>Estado</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>Destacado</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px' }}>Inventario</th>
                <th style={{ padding: '20px 24px', color: '#BDBDBD', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod, index) => (
                <tr key={prod.id} style={{ borderBottom: index === filteredProducts.length - 1 ? 'none' : '1px solid #222222' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <img src={prod.image} alt={prod.title} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover', backgroundColor: '#1A1A1A' }} />
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '15px' }}>{prod.title}</div>
                    <div style={{ color: '#BDBDBD', fontSize: '13px', marginTop: '4px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {prod.description}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ backgroundColor: '#1A1A1A', border: '1px solid #D4A017', color: '#D4A017', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
                      {prod.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#FFFFFF', fontWeight: '700', fontSize: '16px' }}>
                    ${(prod.price || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleStatus(prod)}
                      style={{ 
                        width: '44px', height: '24px', borderRadius: '12px', 
                        backgroundColor: prod.status === 'Activo' ? '#22C55E' : '#333333', 
                        border: 'none', position: 'relative', cursor: 'pointer', transition: 'background-color 0.3s'
                      }}
                    >
                      <div style={{ 
                        width: '20px', height: '20px', backgroundColor: '#FFFFFF', borderRadius: '50%', 
                        position: 'absolute', top: '2px', left: prod.status === 'Activo' ? '22px' : '2px', 
                        transition: 'left 0.3s' 
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <button 
                      onClick={() => toggleFeatured(prod)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: prod.is_featured ? '#D4A017' : '#333333' }}
                    >
                      <Star size={22} fill={prod.is_featured ? '#D4A017' : 'none'} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {prod.stock === null || prod.stock === undefined || prod.stock === '' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#BDBDBD', fontSize: '13px' }}>
                        <Boxes size={16} /> Sin control
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600',
                        color: prod.stock > 10 ? '#22C55E' : (prod.stock > 0 ? '#F59E0B' : '#EF4444')
                      }}>
                        <Boxes size={16} /> {prod.stock} unid.
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => alert('Vista previa')} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleOpenModal(prod)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleOpenModal(prod, true)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', cursor: 'pointer' }}>
                        <Copy size={16} />
                      </button>
                      <button onClick={() => handleDelete(prod.id)} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A1A1A', border: '1px solid #333333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '20px 24px', borderTop: '1px solid #222222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111111' }}>
          <div style={{ color: '#BDBDBD', fontSize: '14px', fontWeight: '500' }}>
            Mostrando {filteredProducts.length > 0 ? 1 : 0} a {filteredProducts.length} de {filteredProducts.length} productos
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

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#111111', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '800px', border: '1px solid #222222', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#FFFFFF', margin: 0, fontSize: '24px', fontWeight: '800' }}>{currentProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#BDBDBD', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                
                {/* Columna Izquierda */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Nombre del producto</label>
                    <input type="text" required value={currentProduct.title} onChange={e => setCurrentProduct({...currentProduct, title: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Descripción</label>
                    <textarea value={currentProduct.description} onChange={e => setCurrentProduct({...currentProduct, description: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', minHeight: '100px', boxSizing: 'border-box', outline: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Precio ($)</label>
                      <input type="number" required value={currentProduct.price} onChange={e => setCurrentProduct({...currentProduct, price: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Categoría</label>
                      <select required value={currentProduct.category} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }}>
                        <option value="">Selecciona...</option>
                        {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Imagen del Producto</label>
                    <div style={{ border: '2px dashed #333333', borderRadius: '12px', padding: '24px', textAlign: 'center', backgroundColor: '#1A1A1A', position: 'relative', overflow: 'hidden', marginBottom: '12px' }}>
                      {currentProduct.image ? (
                        <>
                          <img src={currentProduct.image} alt="preview" style={{ width: '100%', height: '180px', objectFit: 'contain', marginBottom: '12px' }} />
                          <button 
                            type="button" 
                            onClick={() => setCurrentProduct({...currentProduct, image: ''})}
                            style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: '#FFF' }}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div style={{ padding: '20px 0' }}>
                          <ImageIcon size={40} color="#6B7280" style={{ marginBottom: '12px' }} />
                          <div style={{ color: '#FFFFFF', fontWeight: '500', marginBottom: '4px' }}>Haz clic o arrastra una imagen aquí</div>
                          <div style={{ color: '#BDBDBD', fontSize: '13px' }}>PNG, JPG hasta 2MB</div>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setCurrentProduct({...currentProduct, image: reader.result});
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                          />
                        </div>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={currentProduct.image && currentProduct.image.startsWith('data:') ? '' : currentProduct.image} 
                      onChange={e => setCurrentProduct({...currentProduct, image: e.target.value})}
                      placeholder="O pega una URL de imagen (https://...)" 
                      style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#BDBDBD', marginBottom: '8px', fontWeight: '500' }}>Inventario (Dejar vacío si es ilimitado)</label>
                    <input type="number" value={currentProduct.stock || ''} onChange={e => setCurrentProduct({...currentProduct, stock: e.target.value})} placeholder="Ej: 50" style={{ width: '100%', backgroundColor: '#1A1A1A', border: '1px solid #333333', padding: '14px', borderRadius: '10px', color: '#FFFFFF', boxSizing: 'border-box', outline: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: '16px', borderRadius: '10px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Estado del Producto</div>
                      <div style={{ color: '#BDBDBD', fontSize: '13px' }}>Visible en el menú para clientes</div>
                    </div>
                    <select value={currentProduct.status} onChange={e => setCurrentProduct({...currentProduct, status: e.target.value})} style={{ backgroundColor: '#0D0D0D', border: '1px solid #333333', color: '#FFFFFF', padding: '8px', borderRadius: '6px' }}>
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: '16px', borderRadius: '10px' }}>
                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: '600' }}>Destacado</div>
                      <div style={{ color: '#BDBDBD', fontSize: '13px' }}>Aparecerá en la sección principal</div>
                    </div>
                    <button type="button" onClick={() => setCurrentProduct({...currentProduct, is_featured: !currentProduct.is_featured})} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <Star size={28} fill={currentProduct.is_featured ? '#D4A017' : 'none'} color={currentProduct.is_featured ? '#D4A017' : '#BDBDBD'} />
                    </button>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid #222222', paddingTop: '24px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '14px 28px', backgroundColor: '#1A1A1A', color: '#FFFFFF', border: '1px solid #333333', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
                <button type="submit" style={{ padding: '14px 28px', backgroundColor: '#D4A017', color: '#000000', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

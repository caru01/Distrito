import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingBag, ShoppingCart, Copy, Check, X, ArrowLeft, Lock, CreditCard, Wallet, Smartphone, Banknote, Menu } from 'lucide-react';
import { fetchInitData } from './neonService';
import logoImg from './assets/logo-horizontal.png';


function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  
  // Data from Backend
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState({ whatsapp_number: '', nequi_number: '', bancolombia_number: '' });
  const [loading, setLoading] = useState(true);

  // UI State
  const [checkoutStep, setCheckoutStep] = useState(1); // 1 = Cart, 2 = Checkout Form
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  

  // Form State
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: '', 
    address: '',
    barrio: '',
    comment: '',
    deliveryType: 'domicilio',
    paymentMethod: 'efectivo',
    cashAmount: '',
    transferBank: 'nequi' // 'nequi' | 'banco'
  });

  const [copiedNequi, setCopiedNequi] = useState(false);
  const [copiedBanco, setCopiedBanco] = useState(false);

  useEffect(() => {
    fetchInitData()
      .then(data => {
        if(data.status === 'ok') {
          setProducts(data.products || []);
          setSettings(data.settings || {});
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return [{ id: 'all', name: 'Todos' }, ...Array.from(cats).map(c => ({ id: c, name: c }))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0)); // also remove if 0
  };

  const removeItem = (id) => setCart(prev => prev.filter(item => item.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'nequi') { setCopiedNequi(true); setTimeout(() => setCopiedNequi(false), 2000); }
    if (type === 'banco') { setCopiedBanco(true); setTimeout(() => setCopiedBanco(false), 2000); }
  };

  const handleCheckout = async () => {
    if (!customer.name || !customer.phone) {
      alert("Por favor ingresa nombre y teléfono.");
      return;
    }
    if (customer.deliveryType === 'domicilio' && (!customer.address || !customer.barrio)) {
      alert("Por favor ingresa la dirección y el barrio para el domicilio.");
      return;
    }
    if (customer.paymentMethod === 'efectivo' && !customer.cashAmount) {
      alert("Por favor ingresa con cuánto vas a pagar.");
      return;
    }
    
    const phoneNumber = settings.whatsapp_number || "573000000000";
    
    // Obtener y actualizar número de orden local
    let currentOrderNum = parseInt(localStorage.getItem('distrito_order_num') || '1');
    const orderNumber = String(currentOrderNum).padStart(4, '0');
    localStorage.setItem('distrito_order_num', (currentOrderNum + 1).toString());

    let message = `*NUEVA ORDEN (${orderNumber})*\n`;
    
    if (customer.deliveryType === 'domicilio') {
      message += `Hola Distrito BG soy ${customer.name}, me gustaría hacer un pedido\n\n`;
      message += `*Cliente:* ${customer.name}\n`;
      message += `*Teléfono:* ${customer.phone}\n`;
      message += `*Entrega:* 🛵 A Domicilio\n`;
      message += `*Dirección:* ${customer.address}\n`;
      message += `*Barrio:* ${customer.barrio}\n\n`;
    } else {
      message += `Hola Distrito BG soy ${customer.name}, me gustaría hacer un pedido para recoger en el local\n\n`;
      message += `*Cliente:* ${customer.name}\n`;
      message += `*Teléfono:* ${customer.phone}\n`;
      message += `*Entrega:* 🏪 Recoger Local\n\n`;
    }
    
    message += `*Detalle del pedido:*\n`;
    cart.forEach(item => {
      message += `- ${item.qty}x ${item.title} (${formatter.format(item.price * item.qty)})\n`;
    });
    
    if (customer.comment) {
      message += `*Comentarios:* ${customer.comment}\n`;
    }
    
    message += `\n*Medio de Pago:* ${customer.paymentMethod === 'efectivo' ? '💵 Efectivo' : '💳 Transferencia'}\n`;
    
    if (customer.paymentMethod === 'efectivo') {
      message += `*Paga con:* ${formatter.format(customer.cashAmount)}\n`;
      const change = customer.cashAmount - subtotal;
      message += `*Cambio sugerido:* ${change > 0 ? formatter.format(change) : '$0'}\n`;
    } else {
      const isNequi = customer.transferBank === 'nequi';
      message += `*Banco:* ${isNequi ? 'Nequi' : 'Llave Bre-B'}\n`;
      message += `*Número de cuenta:* ${isNequi ? settings.nequi_number : settings.bancolombia_number}\n`;
    }

    message += `*Total a pagar:* ${formatter.format(subtotal)}\n`;
    message += `Gracias.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp INMEDIATAMENTE para evitar el bloqueo del navegador
    window.open(whatsappUrl, '_blank');
    
    // 1. Enviar la orden al backend (Dashboard CRM/Ventas) de forma asíncrona (sin await)
    fetch(`${API_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        cart,
        total: subtotal
      })
    }).catch(error => {
      console.error("Error guardando orden en dashboard:", error);
    });
    
    // Recargar la página después de 1.5 segundos para limpiar el carrito
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const { isOpen, closeTimeStr, openTimeStr } = useMemo(() => {
    if (!settings.open_time || !settings.close_time) {
      return { isOpen: true, closeTimeStr: '10:00 PM', openTimeStr: '06:00 PM' };
    }

    const now = new Date();
    const currentDayMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDay = currentDayMap[now.getDay()];
    
    const isOpenDay = settings.business_days ? settings.business_days.includes(currentDay) : true;
    const [openH, openM] = settings.open_time.split(':').map(Number);
    const [closeH, closeM] = settings.close_time.split(':').map(Number);
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTimeMins = openH * 60 + openM;
    let closeTimeMins = closeH * 60 + closeM;
    
    if (closeTimeMins < openTimeMins) {
      closeTimeMins += 24 * 60; // Pasa la medianoche
    }
    
    let currentCheckTime = currentTime;
    if (currentTime < openTimeMins && currentTime < (closeH * 60 + closeM)) {
       currentCheckTime += 24 * 60;
    }

    const isWithinHours = currentCheckTime >= openTimeMins && currentCheckTime <= closeTimeMins;
    const openStatus = settings.is_store_open !== undefined ? settings.is_store_open : (isOpenDay && isWithinHours);

    const formatTime = (h, m) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const fh = h % 12 || 12;
      return `${fh}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    return { 
      isOpen: openStatus, 
      closeTimeStr: formatTime(closeH, closeM),
      openTimeStr: formatTime(openH, openM)
    };
  }, [settings]);

  if (loading) {
    return (
      <div className="global-loader-container">
        <img src={logoImg} alt="Distrito BG" className="loader-logo" />
        <div className="professional-spinner"></div>
        <p>Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Botón flotante estilo barra para móviles */}
      {cartTotalItems > 0 && !isCartOpenMobile && (
        <div className="mobile-cart-bar" onClick={() => setIsCartOpenMobile(true)}>
          <div className="mobile-cart-bar-items">
            <span className="badge-count">{cartTotalItems}</span>
          </div>
          <span className="mobile-cart-bar-text">Ver pedido</span>
          <span className="mobile-cart-bar-total">{formatter.format(subtotal)}</span>
        </div>
      )}

      {/* Main Area */}
      <main className="main-content">
        {/* Top Navbar */}
        <nav className="top-navbar">
          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Menu size={24} color="white" />
          </button>
          
          <div className="nav-logo">
            <img src={logoImg} alt="Distrito BG" />
          </div>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <a href="#" className="active" onClick={() => setIsMobileMenuOpen(false)}>INICIO</a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)}>MENÚ</a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)}>PROMOCIONES</a>
            <a href="#" onClick={() => setIsMobileMenuOpen(false)}>NOSOTROS</a>
          </div>
          
          <div className="nav-status">
            <div className="status-indicator">
              <span className="dot" style={{ backgroundColor: isOpen ? '#4ade80' : '#ff4757' }}></span>
              <div className="status-text-row">
                <strong>{isOpen ? 'Abierto' : 'Cerrado'}</strong>
                <span>{isOpen ? `Cierra a las ${closeTimeStr}` : `Abre a las ${openTimeStr}`}</span>
              </div>
            </div>
            <button className="desktop-cart-icon" onClick={() => setIsCartOpenMobile(true)}>
              <ShoppingCart size={20} color="white" />
              {cartTotalItems > 0 && <span className="badge">{cartTotalItems}</span>}
            </button>
          </div>
        </nav>

        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-content">
            <h1>MÁS QUE<br/><span className="highlight">HAMBURGUESAS,</span><br/>UNA EXPERIENCIA</h1>
            <div className="hero-features">
              <div className="feature"><span className="icon">🐄</span> CARNE<br/>100% RES</div>
              <div className="feature"><span className="icon">🥬</span> INGREDIENTES<br/>FRESCOS</div>
              <div className="feature"><span className="icon">🔥</span> PREPARACIÓN<br/>AL MOMENTO</div>
            </div>
            <button className="hero-btn">ORDENAR AHORA ➔</button>
          </div>
        </section>

        <h2 className="section-title">NUESTRO MENÚ</h2>

        <div className="shop-layout">
          <div className="shop-products">
            {/* Categories */}
            <div className="categories">
          {categories.map(cat => {
            let icon = '🍔';
            if (cat.name.toLowerCase().includes('papa')) icon = '🍟';
            if (cat.name.toLowerCase().includes('bebida')) icon = '🥤';
            if (cat.name.toLowerCase().includes('promo')) icon = '🔥';
            if (cat.id === 'all') icon = '⭐';

            return (
              <button 
                key={cat.id} 
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="cat-icon">{icon}</span>
                {cat.name.toUpperCase()}
              </button>
            )
          })}
        </div>

        {/* Product Grid */}
        <div className="product-grid">
          {filteredProducts.map(product => {
            const cartItem = cart.find(i => i.id === product.id);
            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="product-image" />
                  ) : (
                    <div className="product-placeholder">Sin Imagen</div>
                  )}
                </div>
                <div className="product-info">
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-rating">
                    <span className="stars">
                      <span style={{ color: '#D4A017' }}>★★★</span>
                      <span style={{ position: 'relative', display: 'inline-block', color: '#555' }}>
                        ★
                        <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: '50%', color: '#D4A017' }}>★</span>
                      </span>
                      <span style={{ color: '#555' }}>★</span>
                    </span>
                    <span className="rating-count">({Math.floor(Math.random() * 100) + 50})</span>
                  </div>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatter.format(product.price)}</span>
                    {cartItem ? (
                      <div className="product-qty-controls">
                        <button className="qty-btn-sm" onClick={() => updateQty(product.id, -1)}><Minus size={16}/></button>
                        <span className="qty-text">{cartItem.qty}</span>
                        <button className="qty-btn-sm" onClick={() => updateQty(product.id, 1)}><Plus size={16}/></button>
                      </div>
                    ) : (
                      <button className="add-btn" onClick={() => addToCart(product)}>
                        + AGREGAR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="no-products">No hay productos en esta categoría.</div>
          )}
        </div>

        {/* Why Choose Us Section */}
        <section className="why-choose-us">
          <h2 className="why-title">¿Por qué elegir Distrito BG?</h2>
          <p className="why-subtitle">Ofrecemos la mejor experiencia en cada bocado, con ingredientes de alta calidad y un servicio inigualable.</p>
          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">🐄</div>
              <h3 className="why-card-title">Carne 100% Res</h3>
              <p className="why-card-desc">Seleccionamos cortes de primera calidad para garantizar el mejor sabor y textura en cada hamburguesa.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🥬</div>
              <h3 className="why-card-title">Ingredientes Frescos</h3>
              <p className="why-card-desc">Vegetales frescos y pan artesanal horneado a diario para crear la combinación perfecta.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🔥</div>
              <h3 className="why-card-title">Preparación al Momento</h3>
              <p className="why-card-desc">Cada pedido se prepara al instante para asegurar frescura, jugosidad y temperatura ideal.</p>
            </div>
            <div className="why-card">
              <div className="why-icon">🛵</div>
              <h3 className="why-card-title">Entrega Rápida</h3>
              <p className="why-card-desc">Llevamos tu comida caliente y en tiempo récord directo a la puerta de tu casa.</p>
            </div>
          </div>
        </section>
          </div>

      {/* Sidebar / Cart Overlay para móviles */}
      <div className={`cart-overlay ${isCartOpenMobile ? 'open' : ''}`} onClick={() => setIsCartOpenMobile(false)}></div>

      <div className="sidebar-wrapper">
        <aside className={`cart-sidebar ${isCartOpenMobile ? 'open' : ''}`}>
          <div className="cart-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            {checkoutStep === 2 && (
              <button className="back-btn" onClick={() => setCheckoutStep(1)}>
                <ArrowLeft size={20} />
              </button>
            )}
            <h2>{checkoutStep === 1 ? '🛒 Tu Pedido' : 'Datos de Envío'}</h2>
            {checkoutStep === 1 && <span className="cart-count">{cartTotalItems}</span>}
          </div>
          <button className="close-cart-btn" onClick={() => setIsCartOpenMobile(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="cart-content-scroll">
          {checkoutStep === 1 ? (
            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} opacity={0.3} />
                  <p>Tu carrito está vacío. ¡Agrega algunos productos!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                    ) : (
                      <div className="cart-item-img placeholder"></div>
                    )}
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.title}</h4>
                      <p className="cart-item-price">{formatter.format(item.price)}</p>
                      <div className="cart-item-actions">
                        <div className="cart-qty-pill">
                          <button className="qty-btn" onClick={() => updateQty(item.id, -1)}><Minus size={14} /></button>
                          <span className="qty">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateQty(item.id, 1)}><Plus size={14} /></button>
                        </div>
                        <button className="delete-btn" onClick={() => removeItem(item.id)}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="customer-form">
              <h3 className="form-section-title">Datos del Cliente</h3>
              <div className="form-group">
                <input type="text" className="form-input" placeholder="Nombre y Apellido" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
              </div>
              <div className="form-group">
                <input type="tel" className="form-input" placeholder="Teléfono (WhatsApp)" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
              </div>

              <h3 className="form-section-title">Forma de Entrega</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="deliveryType" checked={customer.deliveryType === 'domicilio'} onChange={() => setCustomer({...customer, deliveryType: 'domicilio'})} />
                  A Domicilio
                </label>
                <label className="radio-label">
                  <input type="radio" name="deliveryType" checked={customer.deliveryType === 'recoger'} onChange={() => setCustomer({...customer, deliveryType: 'recoger'})} />
                  Recoger Local
                </label>
              </div>

              {customer.deliveryType === 'domicilio' && (
                <>
                  <div className="form-group">
                    <input type="text" className="form-input" placeholder="Dirección completa" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-input" placeholder="Barrio" value={customer.barrio} onChange={e => setCustomer({...customer, barrio: e.target.value})} />
                  </div>
                </>
              )}

              <div className="form-group">
                <input type="text" className="form-input" placeholder="Comentario (opcional)" value={customer.comment} onChange={e => setCustomer({...customer, comment: e.target.value})} />
              </div>

              <h3 className="form-section-title">Forma de Pago</h3>
              <div className="radio-group">
                <label className="radio-label">
                  <input type="radio" name="payment" checked={customer.paymentMethod === 'efectivo'} onChange={() => setCustomer({...customer, paymentMethod: 'efectivo'})} />
                  Efectivo
                </label>
                <label className="radio-label">
                  <input type="radio" name="payment" checked={customer.paymentMethod === 'transferencia'} onChange={() => setCustomer({...customer, paymentMethod: 'transferencia'})} />
                  Transferencia
                </label>
              </div>

              {customer.paymentMethod === 'efectivo' && (
                <div className="form-group animate-in fade-in">
                  <input type="number" className="form-input" placeholder="¿Con cuánto vas a pagar?" value={customer.cashAmount} onChange={e => setCustomer({...customer, cashAmount: e.target.value})} />
                </div>
              )}

              {customer.paymentMethod === 'transferencia' && (
                <div className="transfer-info animate-in fade-in">
                  <p className="transfer-desc" style={{marginBottom: '10px', fontWeight: 'bold'}}>Selecciona el banco al que transferiste:</p>
                  
                  <div className="radio-group" style={{marginBottom: '15px'}}>
                    <label className="radio-label">
                      <input type="radio" name="transferBank" checked={customer.transferBank === 'nequi'} onChange={() => setCustomer({...customer, transferBank: 'nequi'})} />
                      Nequi
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="transferBank" checked={customer.transferBank === 'banco'} onChange={() => setCustomer({...customer, transferBank: 'banco'})} />
                      Llave Bre-B
                    </label>
                  </div>

                  {customer.transferBank === 'nequi' && (
                    <button className="copy-btn" onClick={() => copyToClipboard(settings.nequi_number, 'nequi')}>
                      <span className="copy-text">Nequi: {settings.nequi_number || 'No config'}</span>
                      {copiedNequi ? <Check size={16} color="green" /> : <Copy size={16} color="#999" />}
                    </button>
                  )}
                  
                  {customer.transferBank === 'banco' && (
                    <button className="copy-btn" onClick={() => copyToClipboard(settings.bancolombia_number, 'banco')}>
                      <span className="copy-text">Llave Bre-B: {settings.bancolombia_number || 'No config'}</span>
                      {copiedBanco ? <Check size={16} color="green" /> : <Copy size={16} color="#999" />}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <span>Subtotal</span>
                <span>{formatter.format(subtotal)}</span>
              </div>
              <div className="cart-total">
                <span>Total</span>
                <span>{formatter.format(subtotal)}</span>
              </div>
              
              {checkoutStep === 1 ? (
                <button 
                  className="checkout-btn" 
                  onClick={() => setCheckoutStep(2)}
                  disabled={cart.length === 0}
                >
                  Continuar Pedido
                </button>
              ) : (
                <button 
                  className="checkout-btn" 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                >
                  Confirmar por WhatsApp
                </button>
              )}
              
              {cart.length > 0 && checkoutStep === 1 && (
                <button 
                  className="empty-cart-btn" 
                  onClick={() => setCart([])}
                >
                  Vaciar Pedido
                </button>
              )}
            </div>
            
        </aside>

        {/* Payment info placed outside the cart-sidebar */}
        <div className="premium-payment-methods" style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexShrink: 0 }}>
          <h3 className="premium-payment-title" style={{ color: '#000' }}><CreditCard size={20} /> Paga como quieras</h3>
          <div className="payment-icons-grid">
            <div className="payment-method-item" style={{ color: '#333' }}><Banknote className="payment-method-icon" size={20} /> Efectivo</div>
            <div className="payment-method-item" style={{ color: '#333' }}><Smartphone className="payment-method-icon" size={20} /> Nequi</div>
            <div className="payment-method-item" style={{ color: '#333' }}><Smartphone className="payment-method-icon" size={20} /> Daviplata</div>
            <div className="payment-method-item" style={{ color: '#333' }}><Wallet className="payment-method-icon" size={20} /> Transferencia</div>
          </div>

          <div className="premium-trust-section" style={{ color: '#333', borderColor: '#eee' }}>
            <Lock className="icon" size={24} />
            <div className="premium-trust-text">
              <strong>Compra 100% segura</strong>
              <p>Tu información está protegida y el proceso de compra es totalmente seguro.</p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
}

export default App;

console.log('🚀 Starting backend server...');

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'distrito_super_secret_2026';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Datos de prueba iniciales basados en el frontend
const seedProducts = [
  { title: 'Hamburguesa Clásica', description: 'Carne 100% de res, queso cheddar, lechuga, tomate y nuestra salsa secreta.', price: 15000, category: 'hamburguesas', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500' },
  { title: 'Doble Bacon Burger', description: 'Doble carne, doble queso, tocino crujiente, cebolla caramelizada y salsa BBQ.', price: 22000, category: 'hamburguesas', image: 'https://images.unsplash.com/photo-1594212691516-b2a9e94bd548?auto=format&fit=crop&q=80&w=500' },
  { title: 'Pizza Pepperoni', description: 'Salsa de tomate artesanal, mozzarella fundida y doble pepperoni.', price: 28000, category: 'pizzas', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500' },
  { title: 'Coca-Cola Zero 500ml', description: 'Bebida refrescante sin azúcar.', price: 5000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500' },
  { title: 'Limonada de Coco', description: 'Refrescante limonada natural con crema de coco.', price: 8000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500' },
  { title: 'Cheesecake de Frutos Rojos', description: 'Suave tarta de queso con base de galleta y coulis de frutos rojos.', price: 12000, category: 'postres', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=500' }
];

app.get('/api/pedidos/init', async (req, res) => {
  try {
    // Si no hay DATABASE_URL configurada, devolver datos de prueba
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found. Returning mock data.');
      return res.json({
        status: 'ok',
        products: seedProducts.map((p, i) => ({ id: i + 1, ...p })),
        settings: { whatsapp_number: '', nequi_number: '', bancolombia_number: '' }
      });
    }

    const { rows: products } = await pool.query("SELECT * FROM pedidos_app_products WHERE status = 'Activo' ORDER BY id DESC");
    const { rows: categories } = await pool.query("SELECT * FROM pedidos_app_categories WHERE status = 'Activa' ORDER BY id ASC");
    
    // Asumimos que settings es solo una fila
    let settingsRow = { whatsapp_number: '', nequi_number: '', bancolombia_number: '' };
    try {
      const { rows: settings } = await pool.query('SELECT * FROM pedidos_app_settings LIMIT 1');
      if (settings.length > 0) settingsRow = settings[0];
    } catch (err) {
      console.log('Settings table might not exist yet.');
    }

    res.json({
      status: 'ok',
      products,
      categories,
      settings: settingsRow
    });
  } catch (error) {
    console.error('Error fetching init data:', error);
    // Fallback a los datos de prueba si la tabla no existe (42P01)
    if (error.code === '42P01') { 
      return res.json({
        status: 'ok',
        products: seedProducts.map((p, i) => ({ id: i + 1, ...p })),
        settings: { whatsapp_number: '', nequi_number: '', bancolombia_number: '' },
        message: 'Devolviendo datos locales. Por favor ejecuta el POST a /api/pedidos/setup para crear las tablas en Neon.'
      });
    }
    res.status(500).json({ status: 'error', message: 'Fallo al conectar con la base de datos', details: error.message });
  }
});

app.post('/api/pedidos/checkout', async (req, res) => {
  try {
    const { customer, cart, total } = req.body;
    
    // Si no hay DB, retornar un ID falso para que el frontend siga
    if (!process.env.DATABASE_URL) {
      return res.json({ status: 'ok', order_id: Math.floor(Math.random() * 1000) });
    }

    const { rows } = await pool.query(
      `INSERT INTO pedidos_app_orders 
       (customer_name, customer_phone, address, barrio, delivery_type, payment_method, total, cart_json, source, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING id`,
      [
        customer.name, 
        customer.phone, 
        customer.address || '', 
        customer.barrio || '', 
        customer.deliveryType, 
        customer.paymentMethod, 
        total, 
        JSON.stringify(cart),
        req.body.source || 'Web'
      ]
    );

    res.json({ status: 'ok', order_id: rows[0].id });
  } catch (error) {
    console.error('Error guardando orden:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// AUTH MIDDLEWARE
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

app.post('/api/pedidos/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Si no hay DB, mockear login para desarrollo local si la DB no está conectada
    if (!process.env.DATABASE_URL) {
      if (username === 'admin' && password === 'Distrito2026*') {
        const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ status: 'ok', token });
      }
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const { rows } = await pool.query('SELECT * FROM pedidos_app_users WHERE username = $1', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ status: 'ok', token });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/pedidos/admin/verify', authenticateToken, (req, res) => {
  res.json({ status: 'ok', user: req.user });
});

// Obtener todas las categorías para el panel admin
app.get('/api/pedidos/admin/categories', authenticateToken, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) {
      return res.json({ status: 'ok', categories: [] });
    }
    
    // Obtener categorías y contar productos relacionados
    const { rows } = await pool.query(`
      SELECT c.id, c.name, c.description, c.image, c.status, COUNT(p.id) as products
      FROM pedidos_app_categories c
      LEFT JOIN pedidos_app_products p ON c.name = p.category
      GROUP BY c.id
      ORDER BY c.id ASC
    `);
    
    res.json({ status: 'ok', categories: rows });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Crear categoría
app.post('/api/pedidos/admin/categories', authenticateToken, async (req, res) => {
  try {
    const { name, description, image, status } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO pedidos_app_categories (name, description, image, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, image, status || 'Activa']
    );
    res.json({ status: 'ok', category: rows[0] });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Actualizar categoría
app.put('/api/pedidos/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;
    const { rows } = await pool.query(
      'UPDATE pedidos_app_categories SET name = $1, description = $2, image = $3, status = $4 WHERE id = $5 RETURNING *',
      [name, description, image, status, id]
    );
    res.json({ status: 'ok', category: rows[0] });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Eliminar categoría
app.delete('/api/pedidos/admin/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pedidos_app_categories WHERE id = $1', [id]);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Obtener todas las ordenes para admin
app.get('/api/pedidos/admin/orders', authenticateToken, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({ status: 'ok', orders: [] });
    const { rows } = await pool.query('SELECT * FROM pedidos_app_orders ORDER BY created_at DESC');
    res.json({ status: 'ok', orders: rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Actualizar estado de orden
app.put('/api/pedidos/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await pool.query(
      'UPDATE pedidos_app_orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json({ status: 'ok', order: rows[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Eliminar orden
app.delete('/api/pedidos/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pedidos_app_orders WHERE id = $1', [id]);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ================= PRODUCTOS =================
// Obtener todos los productos admin
app.get('/api/pedidos/admin/products', authenticateToken, async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.json({ status: 'ok', products: [] });
    const { rows } = await pool.query('SELECT * FROM pedidos_app_products ORDER BY id DESC');
    res.json({ status: 'ok', products: rows });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Crear producto
app.post('/api/pedidos/admin/products', authenticateToken, async (req, res) => {
  try {
    const { title, description, price, category, image, status, is_featured, stock } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO pedidos_app_products (title, description, price, category, image, status, is_featured, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, price, category, image, status || 'Activo', is_featured || false, stock || null]
    );
    res.json({ status: 'ok', product: rows[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Actualizar producto
app.put('/api/pedidos/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, image, status, is_featured, stock } = req.body;
    const { rows } = await pool.query(
      'UPDATE pedidos_app_products SET title = $1, description = $2, price = $3, category = $4, image = $5, status = $6, is_featured = $7, stock = $8 WHERE id = $9 RETURNING *',
      [title, description, price, category, image, status, is_featured, stock, id]
    );
    res.json({ status: 'ok', product: rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// Eliminar producto
app.delete('/api/pedidos/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pedidos_app_products WHERE id = $1', [id]);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

// ================= CONFIGURACION =================
app.get('/api/pedidos/admin/settings', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos_app_settings WHERE id = 1');
    if (rows.length === 0) {
      await pool.query('INSERT INTO pedidos_app_settings (id) VALUES (1)');
      const { rows: newRows } = await pool.query('SELECT * FROM pedidos_app_settings WHERE id = 1');
      return res.json({ status: 'ok', settings: newRows[0] });
    }
    res.json({ status: 'ok', settings: rows[0] });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.put('/api/pedidos/admin/settings', authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    // Build dynamic UPDATE query
    const keys = Object.keys(data).filter(k => k !== 'id' && k !== 'updated_at');
    if (keys.length === 0) return res.json({ status: 'ok', message: 'No fields to update' });
    
    const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map(k => data[k]);
    
    // Add updated_at manually if needed, or rely on schema default
    
    const query = `UPDATE pedidos_app_settings SET ${setString} WHERE id = 1 RETURNING *`;
    const { rows } = await pool.query(query, values);
    
    res.json({ status: 'ok', settings: rows[0] });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

app.post('/api/pedidos/setup', async (req, res) => {
  try {
    if (!process.env.DATABASE_URL) return res.status(400).json({ error: 'No hay DATABASE_URL en el archivo .env' });

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos_app_products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        category VARCHAR(100),
        image TEXT
      );
      
      ALTER TABLE pedidos_app_products ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Activo';
      ALTER TABLE pedidos_app_products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
      ALTER TABLE pedidos_app_products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT NULL;
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        whatsapp_number VARCHAR(50),
        nequi_number VARCHAR(50),
        bancolombia_number VARCHAR(50)
      );
      CREATE TABLE IF NOT EXISTS pedidos_app_orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        address TEXT,
        barrio VARCHAR(255),
        delivery_type VARCHAR(50),
        payment_method VARCHAR(50),
        total INTEGER,
        cart_json JSONB,
        status VARCHAR(50) DEFAULT 'Nuevo',
        source VARCHAR(50) DEFAULT 'Web',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      ALTER TABLE pedidos_app_orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Nuevo';
      ALTER TABLE pedidos_app_orders ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Web';
      ALTER TABLE pedidos_app_orders ADD COLUMN IF NOT EXISTS notes TEXT;

      CREATE TABLE IF NOT EXISTS pedidos_app_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS pedidos_app_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        status VARCHAR(20) DEFAULT 'Activa',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Insertar usuario por defecto si no hay
    const { rows: userCount } = await pool.query('SELECT COUNT(*) FROM pedidos_app_users');
    if (parseInt(userCount[0].count) === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Distrito2026*', salt);
      await pool.query('INSERT INTO pedidos_app_users (username, password_hash, role) VALUES ($1, $2, $3)', ['admin', hashedPassword, 'admin']);
      console.log('Usuario admin creado por defecto.');
    }

    // Solo insertar si esta vacía
    const { rows: count } = await pool.query('SELECT COUNT(*) FROM pedidos_app_products');
    if (parseInt(count[0].count) === 0) {
      for (const p of seedProducts) {
        await pool.query(
          'INSERT INTO pedidos_app_products (title, description, price, category, image) VALUES ($1, $2, $3, $4, $5)',
          [p.title, p.description, p.price, p.category, p.image]
        );
      }
    }

    res.json({ status: 'ok', message: 'Tablas creadas e inicializadas exitosamente en Neon!' });
  } catch (error) {
    console.error('Error de setup:', error);
    res.status(500).json({ status: 'error', error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;

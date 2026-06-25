const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Pool } = require('pg');

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

    const { rows: products } = await pool.query('SELECT * FROM pedidos_app_products');
    
    // Asumimos que settings es solo una fila
    let settingsRow = { whatsapp_number: '', nequi_number: '', bancolombia_number: '' };
    try {
      const { rows: settings } = await pool.query('SELECT * FROM settings LIMIT 1');
      if (settings.length > 0) settingsRow = settings[0];
    } catch (err) {
      console.log('Settings table might not exist yet.');
    }

    res.json({
      status: 'ok',
      products,
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
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        whatsapp_number VARCHAR(50),
        nequi_number VARCHAR(50),
        bancolombia_number VARCHAR(50)
      );
    `);

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
app.listen(PORT, () => {
  console.log(\`Servidor backend corriendo en http://localhost:\${PORT}\`);
});

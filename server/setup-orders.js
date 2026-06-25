require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_pClfKMJxI0a7@ep-round-lake-at22joot-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Creando tabla de ordenes en Neon...');
    await pool.query(`
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
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ TABLA CREADA CON EXITO');
  } catch(e) {
    console.error('❌ Error:', e.message);
  } finally {
    pool.end();
  }
}
run();

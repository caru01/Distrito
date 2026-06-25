const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_pClfKMJxI0a7@ep-round-lake-at22joot-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting...');
    const { rows } = await pool.query('SELECT id, title, price, category FROM pedidos_app_products LIMIT 5');
    console.log('PRODUCTS:', JSON.stringify(rows, null, 2));
  } catch (e) {
    console.log('ERROR:', e.message);
  } finally {
    await pool.end();
  }
}

run();

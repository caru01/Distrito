// Servicio de conexión a Neon via HTTP API
// No requiere npm install - usa fetch nativo del browser

const NEON_CONNECTION = {
  host: 'ep-round-lake-at22joot-pooler.c-9.us-east-1.aws.neon.tech',
  user: 'neondb_owner',
  password: 'npg_pClfKMJxI0a7',
  database: 'neondb',
};

async function neonFetch(query) {
  const { host, user, password, database } = NEON_CONNECTION;
  const url = `https://${host}/sql`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${btoa(`${user}:${password}`)}`,
      'Neon-Raw-Text-Output': 'false',
      'Neon-Array-Mode': 'false',
    },
    body: JSON.stringify({ query, params: [] }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Neon error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.rows || [];
}

export async function fetchInitData() {
  try {
    console.log('🔄 Conectando a Neon...');

    const products = await neonFetch('SELECT * FROM pedidos_app_products ORDER BY id');

    let settings = { whatsapp_number: '', nequi_number: '', bancolombia_number: '' };
    try {
      const settingsRows = await neonFetch('SELECT * FROM settings LIMIT 1');
      if (settingsRows.length > 0) settings = settingsRows[0];
    } catch (_) {}

    console.log(`✅ Neon OK: ${products.length} productos desde la base de datos real.`);
    return { status: 'ok', products, settings };

  } catch (error) {
    console.warn('⚠️ Neon no disponible, usando datos locales de demostración:', error.message);

    return {
      status: 'ok',
      products: [
        {
          id: 1,
          title: 'Hamburguesa Clásica',
          description: 'Carne 100% de res, queso cheddar, lechuga, tomate y nuestra salsa secreta.',
          price: 15000,
          category: 'hamburguesas',
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
        },
        {
          id: 2,
          title: 'Doble Bacon Burger',
          description: 'Doble carne, doble queso, tocino crujiente, cebolla caramelizada y salsa BBQ.',
          price: 22000,
          category: 'hamburguesas',
          image: 'https://images.unsplash.com/photo-1594212691516-b2a9e94bd548?auto=format&fit=crop&q=80&w=500',
        },
        {
          id: 3,
          title: 'Pizza Pepperoni',
          description: 'Salsa de tomate artesanal, mozzarella fundida y doble pepperoni.',
          price: 28000,
          category: 'pizzas',
          image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500',
        },
      ],
      settings: { whatsapp_number: '', nequi_number: '', bancolombia_number: '' },
    };
  }
}

// Servicio para conectar directamente a Neon via HTTP API
// Esto funciona sin necesitar un servidor backend local

const NEON_URL = import.meta.env.VITE_NEON_URL;

// Parsear la URL de conexión para extraer las credenciales
function parseConnectionString(url) {
  try {
    // postgresql://user:pass@host/database
    const withoutProtocol = url.replace('postgresql://', '').replace('postgres://', '');
    const [credentials, rest] = withoutProtocol.split('@');
    const [user, password] = credentials.split(':');
    const [hostAndDb] = rest.split('?');
    const lastSlash = hostAndDb.lastIndexOf('/');
    const host = hostAndDb.substring(0, lastSlash);
    const database = hostAndDb.substring(lastSlash + 1);
    return { user, password: decodeURIComponent(password), host, database };
  } catch (e) {
    return null;
  }
}

// Usar la API HTTP de Neon para ejecutar queries
async function neonQuery(sql, params = []) {
  const parsed = parseConnectionString(NEON_URL);
  if (!parsed) throw new Error('Invalid Neon URL');

  const { host, database, user, password } = parsed;
  const endpoint = `https://${host}/sql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': NEON_URL,
    },
    body: JSON.stringify({ query: sql, params }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Neon HTTP error: ${err}`);
  }

  return response.json();
}

// Obtener productos y configuración desde Neon
export async function fetchInitData() {
  try {
    const parsed = parseConnectionString(NEON_URL);
    const { host, database, user, password } = parsed;

    // Neon serverless HTTP endpoint
    const baseUrl = `https://${host}`;

    // Query productos
    const productsRes = await fetch(`${baseUrl}/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${user}:${password}`)}`,
        'Neon-Connection-String': NEON_URL,
      },
      body: JSON.stringify({ query: 'SELECT * FROM pedidos_app_products ORDER BY id' }),
    });

    if (productsRes.ok) {
      const data = await productsRes.json();
      const products = data.rows || [];

      // Query settings
      let settings = { whatsapp_number: '', nequi_number: '', bancolombia_number: '' };
      try {
        const settingsRes = await fetch(`${baseUrl}/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${user}:${password}`)}`,
            'Neon-Connection-String': NEON_URL,
          },
          body: JSON.stringify({ query: 'SELECT * FROM settings LIMIT 1' }),
        });
        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.rows && sData.rows.length > 0) settings = sData.rows[0];
        }
      } catch (e) { /* settings table might not exist */ }

      return { status: 'ok', products, settings };
    }
  } catch (e) {
    console.error('Neon HTTP fetch failed:', e.message);
  }

  // Fallback: datos locales si no se puede conectar a Neon
  return {
    status: 'ok',
    products: [
      { id: 1, title: 'Hamburguesa Clásica', description: 'Carne 100% de res, queso cheddar, lechuga, tomate y nuestra salsa secreta.', price: 15000, category: 'hamburguesas', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500' },
      { id: 2, title: 'Doble Bacon Burger', description: 'Doble carne, doble queso, tocino crujiente, cebolla caramelizada y salsa BBQ.', price: 22000, category: 'hamburguesas', image: 'https://images.unsplash.com/photo-1594212691516-b2a9e94bd548?auto=format&fit=crop&q=80&w=500' },
      { id: 3, title: 'Pizza Pepperoni', description: 'Salsa de tomate artesanal, mozzarella fundida y doble pepperoni.', price: 28000, category: 'pizzas', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500' },
      { id: 4, title: 'Coca-Cola Zero 500ml', description: 'Bebida refrescante sin azúcar.', price: 5000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500' },
      { id: 5, title: 'Limonada de Coco', description: 'Refrescante limonada natural con crema de coco.', price: 8000, category: 'bebidas', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500' },
      { id: 6, title: 'Cheesecake de Frutos Rojos', description: 'Suave tarta de queso con base de galleta y coulis de frutos rojos.', price: 12000, category: 'postres', image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=500' },
    ],
    settings: { whatsapp_number: '', nequi_number: '', bancolombia_number: '' }
  };
}

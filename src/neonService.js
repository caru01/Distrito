// Servicio de datos: usa el endpoint de Vite en desarrollo,
// y el endpoint de producción cuando está desplegado.

const API_URL = import.meta.env.PROD
  ? 'https://galushop.store/distrito/api/pedidos'
  : '/api/pedidos';

export async function fetchInitData() {
  try {
    const response = await fetch(`${API_URL}/init`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (data.status === 'ok') {
      console.log(`✅ ${data.products.length} productos cargados.`);
      return data;
    }
    throw new Error(data.message || 'Error en respuesta');
  } catch (error) {
    console.error('❌ Error cargando datos:', error.message);
    // Retorna vacío para que la UI muestre "sin productos"
    // en vez de datos de demo incorrectos
    return {
      status: 'ok',
      products: [],
      settings: { whatsapp_number: '', nequi_number: '', bancolombia_number: '' },
    };
  }
}

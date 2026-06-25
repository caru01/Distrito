fetch('http://localhost:3001/api/pedidos/init')
  .then(res => res.json())
  .then(data => console.log('ÉXITO:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('ERROR:', err.message));

try {
  const pg = require('pg');
  console.log('PG_FOUND: ' + require.resolve('pg'));
} catch(e) {
  console.log('PG_ERROR: ' + e.message);
}

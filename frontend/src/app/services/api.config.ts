// Si estamos en localhost, usamos el servidor local Node.js (puerto 3000).
// En producción (Vercel), usamos la ruta relativa '/api' para conectar con las Serverless Functions.
export const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000/api'
  : '/api';

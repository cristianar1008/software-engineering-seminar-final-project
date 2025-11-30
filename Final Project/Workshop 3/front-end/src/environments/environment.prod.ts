export const environment = {
  production: true,

  // Java → NGINX reenvía /auth/ -> auth-backend:8083
  javaApiUrl: '/auth/api',

  // Python → NGINX reenvía /api/ -> fastapi-service:8000
  pythonApiUrl: '/api/v1'
};

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Recuperamos el token. 
  // OJO: Asegúrate que tu función 'saveToken' lo guardó con la clave 'token'
  const token = localStorage.getItem('auth_token'); 

  // 2. Si existe el token, clonamos la petición y le inyectamos el Header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // 3. Si no hay token, dejamos pasar la petición tal cual (ej: login)
  return next(req);
};
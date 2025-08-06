// src/app/interceptors/error.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('[ErrorInterceptor] HTTP Error:', error);

      let errorMsg = 'Възникна грешка. Опитайте отново.';

      if (error.status === 0) {
        errorMsg = '❌ Сървърът не отговаря.';
      } else if (error.status === 401) {
        errorMsg = 'Не сте логнат. Пренасочване към Login.';
        router.navigate(['/login']);
      } else if (error.status === 403) {
        errorMsg = 'Нямате достъп до тази операция.';
      } else if (error.status >= 500) {
        errorMsg = 'Сървърна грешка. Опитайте по-късно.';
      } else if (error.error?.message) {
        errorMsg = error.error.message;
      }

      alert(errorMsg);
      return throwError(() => error);
    })
  );
};

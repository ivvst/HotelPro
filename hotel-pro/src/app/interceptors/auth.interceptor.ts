import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);

    // ✅ Добавяме cookies автоматично
    const clonedRequest = req.clone({ withCredentials: true });

    return next(clonedRequest).pipe(
        catchError((error) => {
            console.error('[AuthInterceptor] HTTP Error:', error);

            if (error.status === 401) {
                console.warn('[AuthInterceptor] 401 Unauthorized → Redirect to /login');
                router.navigate(['/login']);
            } else if (error.status === 403) {
                console.warn('[AuthInterceptor] 403 Forbidden → Access denied');
                alert('Нямате достъп до тази операция.');
            }

            return throwError(() => error);
        })
    );
};

// src/app/interceptors/loader.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from '../services/loaded.service';

export const LoaderInterceptor: HttpInterceptorFn = (req, next) => {
    const loaderService = inject(LoaderService);

    loaderService.show();

    return next(req).pipe(
        finalize(() => loaderService.hide())
    );
};

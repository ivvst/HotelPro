import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { VipService } from '../types/vip';

@Injectable({ providedIn: 'root' })
export class VipServicesApi {
    private readonly apiUrl = `${environment.apiUrl}/vips`;
    constructor(private http: HttpClient) { }

    getAll(): Observable<VipService[]> {
        return this.http.get<VipService[]>(this.apiUrl, { withCredentials: true });
    }

    create(name: string): Observable<VipService> {
        return this.http.post<VipService>(this.apiUrl, { name }, { withCredentials: true });
    }

    delete(id: string): Observable<{ message: string; id: string }> {
        return this.http.delete<{ message: string; id: string }>(`${this.apiUrl}/${id}`, { withCredentials: true });
    }
}

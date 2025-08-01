// src/app/services/cruises.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Cruise } from '../types/cruise';
import { environment } from '../environments/environment';
import { Excursion } from '../types/excursion';

@Injectable({
  providedIn: 'root'
})
export class CruiseService {
  private readonly apiUrl = `${environment.apiUrl}/cruises`;
  constructor(private http: HttpClient) { }

  /** Retrieve all cruises */
  getAllCruises(): Observable<Cruise[]> {
    return this.http.get<Cruise[]>(this.apiUrl).pipe(
      // RxJS map: премапваме всеки Cruise (тук без промяна на полетата)
      map(cruises =>
        cruises.map(c => ({ ...c }))
      )
    );
  }

  addCruise(cruise: Partial<Cruise>) {
    return this.http.post<Cruise>(this.apiUrl, cruise);
  }

  getCruiseById(id: string) {
    return this.http.get<Cruise>(`${this.apiUrl}/${id}`);
  }

  updateCruise(id: string, cruise: Partial<Cruise>) {
    return this.http.put<Cruise>(`${this.apiUrl}/${id}`, cruise);

  }

  // === CRUD за екскурзиите към круиз ===

  // Взимане на всички екскурзии за круиз:
  getExcursions(cruiseId: string): Observable<Excursion[]> {
    return this.http.get<Excursion[]>(`${this.apiUrl}/${cruiseId}/excursions`);
  }

  // Добавяне на екскурзия към круиз:
  addExcursion(cruiseId: string, excursion: Excursion): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${cruiseId}/excursions`, excursion);
  }

  // Редактиране на екскурзия:
  updateExcursion(cruiseId: string, excursionId: string, excursion: Excursion): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${cruiseId}/excursions/${excursionId}`, excursion);
  }

  // Изтриване на екскурзия:
  deleteExcursion(cruiseId: string, excursionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cruiseId}/excursions/${excursionId}`);
  }
}

// src/app/services/cruise.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Cruise } from '../types/cruise';
import { environment } from '../environments/environment';
import { Excursion } from '../types/excursion';

@Injectable({
  providedIn: 'root'
})
export class CruiseService {
  private readonly apiUrl = `${environment.apiUrl}/cruises`;

  /** 🔄 Нов state за реактивни круизи */
  private cruisesSubject = new BehaviorSubject<Cruise[]>([]);
  public cruises$ = this.cruisesSubject.asObservable();

  constructor(private http: HttpClient) { }

  /** 🔁 Презарежда круизи от API */
  refreshCruises() {
    this.http.get<Cruise[]>(this.apiUrl).subscribe({
      next: cruises => this.cruisesSubject.next(cruises),
      error: err => console.error('Cruise load error', err)
    });
  }

  /** Получаване на всички круизи (за сигнали) */
  getCruisesSnapshot() {
    return this.cruisesSubject.getValue();
  }

  /** 🔁 Стар метод — остава */
  getAllCruises(): Observable<Cruise[]> {
    return this.http.get<Cruise[]>(this.apiUrl);
  }

  addCruise(cruise: Partial<Cruise>) {
    return this.http.post<Cruise>(this.apiUrl, cruise).pipe(
      tap(() => this.refreshCruises()) // 🔁 автоматичен refresh
    );
  }

  getCruiseById(id: string) {
    return this.http.get<Cruise>(`${this.apiUrl}/${id}`);
  }

  updateCruise(id: string, cruise: Partial<Cruise>) {
    return this.http.put<Cruise>(`${this.apiUrl}/${id}`, cruise).pipe(
      tap(() => this.refreshCruises())
    );
  }

  deleteCruise(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshCruises())
    );
  }

  getExcursions(cruiseId: string): Observable<Excursion[]> {
    return this.http.get<Excursion[]>(`${this.apiUrl}/${cruiseId}/excursions`);
  }

  addExcursion(cruiseId: string, excursion: Excursion): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${cruiseId}/excursions`, excursion);
  }

  updateExcursion(cruiseId: string, excursionId: string, excursion: Excursion): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${cruiseId}/excursions/${excursionId}`, excursion);
  }

  deleteExcursion(cruiseId: string, excursionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${cruiseId}/excursions/${excursionId}`);
  }

  requestExcursionDelete(cruiseId: string, exId: string) {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${cruiseId}/excursions/${exId}/request-delete`,
      {},
      { withCredentials: true }
    );
  }

  rejectExcursionDelete(cruiseId: string, exId: string) {
    return this.http.patch<{ message: string }>(
      `${this.apiUrl}/${cruiseId}/excursions/${exId}/reject-delete`,
      {},
      { withCredentials: true }
    );
  }
}

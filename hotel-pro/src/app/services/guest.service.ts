import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Guest } from '../types/guests';
import { environment } from '../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GuestService {
    private readonly apiUrl = `${environment.apiUrl}/guests`;
    constructor(private http: HttpClient) { }

    /** Retrieve all guests */
    getAllGuests(): Observable<Guest[]> {
        return this.http.get<Guest[]>(this.apiUrl);
    }

    /** Retrieve a single guest by ID */
    getGuestById(id: string): Observable<Guest> {
        return this.http.get<Guest>(`${this.apiUrl}/${id}`);
    }

    /** Create a new guest */
    createGuest(guest: Guest): Observable<Guest> {
        return this.http.post<Guest>(this.apiUrl, guest);
    }

    /** Update an existing guest */
    updateGuest(id: string, guest: Partial<Guest>): Observable<Guest> {
        return this.http.put<Guest>(`${this.apiUrl}/${id}`, guest);
    }

    /** Delete a guest by ID */
    deleteGuest(id: string): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
    }

    addExcursionToGuest(guestId: string, excursionId: string, excursionName: string): Observable<Guest> {
        return this.http.patch<Guest>(`${this.apiUrl}/${guestId}/excursions`, { excursionId, excursionName });
    }

    // Премахни екскурзия от гост
    removeExcursionFromGuest(guestId: string, excursionId: string): Observable<Guest> {
        return this.http.delete<Guest>(`${this.apiUrl}/${guestId}/excursions/${excursionId}`);
    }
}

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

    getGuestsByExcursionId(excursionId: string) {
        return this.http.get<Guest[]>(`${this.apiUrl}`, {
            params: { excursionId }
        });
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
    addExcursionToGuest(guestId: string, payload: { _id: string; name: string }) {
        return this.http.patch<Guest>(`${this.apiUrl}/${guestId}/excursions`, payload, { withCredentials: true });
    }



    removeExcursionFromGuest(guestId: string, excursionId: string) {
        return this.http.delete<Guest>(`${this.apiUrl}/${guestId}/excursions/${excursionId}`, { withCredentials: true });
    }
}

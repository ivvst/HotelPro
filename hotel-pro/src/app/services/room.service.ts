import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../types/room';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
 private readonly apiUrl = `${environment.apiUrl}/rooms`;
     constructor(private http: HttpClient) { }

  /**
   * Retrieve all rooms with their current guest count and VIP flag
   */
  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  /**
   * Retrieve a single room by number
   */
  getRoomByNumber(number: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${number}`);
  }
}

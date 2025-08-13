import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";
import { Task } from "../types/task";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class NotifyService {
    private readonly apiUrl = `${environment.apiUrl}/notify`;

    constructor(private http: HttpClient) { }

    /** Взимане на всички задачи */
    getAll() {
        return this.http.get<Task[]>(this.apiUrl, { withCredentials: true });
    }

    /** Създаване на нова задача */
    create(text: string, assignedTo: string) {
        return this.http.post<Task>(this.apiUrl, { text, assignedTo }, { withCredentials: true });
    }

    /** Маркиране като изпълнена */
    markDone(_id: string, userId: string) {
        return this.http.patch<Task>(`${this.apiUrl}/${_id}/done`, { userId }, { withCredentials: true });
    }
}
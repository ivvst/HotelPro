// import { Observable } from "rxjs";
// import { UserForAuth } from "../types/user";
// import { HttpClient } from "@angular/common/http";
// import { environment } from '../environments/environment';


// export class AuthService {


//   constructor(private http: HttpClient) {}

//   // Логин
//   login(credentials: { email: string; password: string }): Observable<{ user: UserForAuth }> {
//     return this.http.post<{ user: UserForAuth }>(`${this.apiUrl}/login`, credentials);
//   }

//   // Регистрация
//   register(data: {
//     email: string;
//     password: string;
//     repeatPassword: string;
//     username: string;
//     fullName: string;
//   }): Observable<{ user: UserForAuth }> {
//     return this.http.post<{ user: UserForAuth }>(`${this.apiUrl}/register`, data);
//   }

//   // Изход (logout)
//   logout(): void {
//     localStorage.removeItem('user');
//   }

//   getUser(): UserForAuth | null {
//     const raw = localStorage.getItem('user');
//     return raw ? JSON.parse(raw) as UserForAuth : null;
//   }

//   isAdmin(): boolean {
//     const user = this.getUser();
//     return user?.role === 'admin';
//   }

//   isLoggedIn(): boolean {
//     return !!this.getUser();
//   }

//   getUserRole(): string | undefined {
//     const user = this.getUser();
//     return user?.role;
//   }

//   setUser(user: UserForAuth): void {
//     localStorage.setItem('user', JSON.stringify(user));
//   }
// }
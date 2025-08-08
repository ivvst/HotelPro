import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { User, UserForAuth } from '../types/user';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  private readonly KEY = '[auth]';
  private readonly apiUrl = environment.apiUrl;

  private user$$ = new BehaviorSubject<UserForAuth | null>(null);
  user$ = this.user$$.asObservable();

  private userSubscription: Subscription;
  public user: UserForAuth | null = null;

  constructor(private http: HttpClient) {
    this.restoreSession();

    this.userSubscription = this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  /** Getter: има ли логнат потребител */
  get isLogged(): boolean {
    return !!this.user;
  }

  /** Getter: ролята на текущия потребител */
  get role(): string | undefined {
    return this.user?.role;
  }

  /** Проверка: дали е админ */
  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  /** Зарежда потребител от sessionStorage */
  restoreSession() {
    const storedUser = sessionStorage.getItem(this.KEY);
    if (storedUser) {
      try {
        const user: UserForAuth = JSON.parse(storedUser);
        this.setUser(user);
      } catch {
        this.clearUser();
      }
    }
  }

  /** Централизирано сетване на потребител */
  setUser(user: UserForAuth | null) {
    this.user$$.next(user);
    if (user) {
      sessionStorage.setItem(this.KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(this.KEY);
    }
  }

  updateUser(id: string, data: Partial<User>) {
    return this.http.put<User>(
      `${this.apiUrl}/users/${id}`,
      data,
      { withCredentials: true }
    );
  }
  /** Централизирано изчистване на потребител */
  clearUser() {
    this.setUser(null);
  }

  /** Регистрация */
  register(username: string, email: string, password: string, repeatPassword: string, fullName: string) {
    return this.http.post<UserForAuth>(
      `${this.apiUrl}/register`,
      { username, email, password, repeatPassword, fullName },
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Логин */
  login(email: string, password: string) {
    return this.http.post<UserForAuth>(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Логаут */
  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearUser())
    );
  }
  //Показване на всички потребители 
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      withCredentials: true
    });
  }
  /** Вземане на профил */
  getProfileInfo() {
    return this.http.get<UserForAuth>(
      `${this.apiUrl}/users/profile`,
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Обновяване на профил */
  updateProfile(username: string, email: string, role?: 'user' | 'admin') {
    return this.http.put<UserForAuth>(
      `${this.apiUrl}/users/profile`,
      { username, email, role },
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }
  //**Admin choose user for an update */
  getUserById(id: string) {
    return this.http.get<UserForAuth>(`${this.apiUrl}/users/${id}`, { withCredentials: true });
  }

  updateUserById(id: string, data: { username: string, email: string, role?: string }) {
    return this.http.put<UserForAuth>(`${this.apiUrl}/users/${id}`, data, { withCredentials: true });
  }

  /** Премахване на Subscription */
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}

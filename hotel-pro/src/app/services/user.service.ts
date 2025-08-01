import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subscription, tap } from 'rxjs';
import { UserForAuth } from '../types/user';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  private user$$ = new BehaviorSubject<UserForAuth | undefined>(undefined);
  user$ = this.user$$.asObservable();

  public user: UserForAuth | undefined;
  private userSubscription: Subscription | null = null;

  readonly KEY = '[auth]';
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.restoreSession();

    this.userSubscription = this.user$.subscribe((user) => {
      this.user = user;
    });
  }

  /** Getter за проверка дали има логнат потребител */
  get isLogged(): boolean {
    return !!this.user;
  }

  /** Зарежда потребител от sessionStorage */
  restoreSession() {
    const storedUser = sessionStorage.getItem(this.KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.setUser(user);
    }
  }

  /** Централизирано сетване на потребител */
  setUser(user: UserForAuth) {
    this.user$$.next(user);
    sessionStorage.setItem(this.KEY, JSON.stringify(user));
  }

  /** Централизирано изчистване на потребител */
  clearUser() {
    this.user$$.next(undefined);
    sessionStorage.removeItem(this.KEY);
  }

  /** Регистрация */
  register(username: string, email: string, password: string, rePassword: string, fullName: string) {
    return this.http.post<UserForAuth>(
      `${this.apiUrl}/register`,
      { username, email, password, rePassword, fullName },
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

  /** Вземане на профил от бекенда */
  getProfile() {
    return this.http.get<UserForAuth>(
      `${this.apiUrl}/users/profile`,
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Обновяване на потребителски данни */
  updateProfile(username: string, email: string) {
    return this.http.put<UserForAuth>(
      `${this.apiUrl}/users/profile`,
      { username, email },
      { withCredentials: true }
    ).pipe(
      tap((user) => this.setUser(user))
    );
  }

  /** Изчистване на Subscription */
  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
  }
}

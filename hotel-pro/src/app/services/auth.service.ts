import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return match ? match[1] : null;
  }

  getUserRole(): 'admin' | 'user' | null {
    const token = this.getToken();
    console.log(token);
    
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return payload.role || null;
    } catch (error) {
      console.error('Грешка при декодиране на токена:', error);
      return null;
    }
  }
}

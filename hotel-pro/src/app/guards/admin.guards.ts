import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    const user = this.userService.user;
    if (user && user.role === 'admin') {
      return true; // Позволяваме достъп само ако user.role е 'admin'
    } else {
      this.router.navigate(['/not-authorized']); // или към друга страница
      return false;
    }
  }
}

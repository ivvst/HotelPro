import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // твоя AuthService
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // 🔍 Проверка дали има потребител
    this.isLoggedIn = !!this.userService.isLogged;
    // Ако AuthService има метод за проверка:
    // this.isLoggedIn = this.authService.isAuthenticated();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToMain(): void {
    this.router.navigate(['/home']); // страницата след логин
  }
}

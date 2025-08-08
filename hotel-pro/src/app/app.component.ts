import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { CommonModule } from '@angular/common';
// import { DashboardComponent } from './dashboard/dashboard.component';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('slideSidebar', [
      state('in', style({ transform: 'translateX(0%)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      transition('in <=> out', animate('250ms ease-in-out'))
    ])
  ]
})
export class AppComponent {
  protected title = 'hotel-pro';
  sidebarVisible = true;
  showDropdown = false;
  openMenu: string | null = null;

  constructor(public userService: UserService, private router: Router) { }

  toggleMenu(menuName: string) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  goToRoom(): void {
    this.router.navigate(['/room'], { fragment: 'table' });
  }

  loadProfile(): void {
    this.userService.getProfileInfo().subscribe({
      next: (user) => {
        console.log('Profile:', user);
        this.userService.setUser(user);
      },
      error: (err) => {
        console.error('Грешка при взимане на профил:', err);
        this.userService.clearUser();
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onNotifClick(): void {
    console.log('🔔 Камбанката беше натисната');
  }

  onProfileClick(): void {
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown toggled:', this.showDropdown);
  }

  logout(): void {
    this.showDropdown = false;
    this.userService.logout().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  isLoggedIn(): boolean {
    return this.userService.isLogged; // методът ти от UserService
  }
}

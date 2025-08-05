import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { CommonModule } from '@angular/common';

import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
@Component({
  selector: 'app-root',
  imports: [CommonModule,
    RouterModule, RouterOutlet],      // ← make routerLink & router-outlet available

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
  constructor(public userService: UserService, private router: Router) { }

  goToRoom() {
    this.router.navigate(['/room'], { fragment: 'table' });
  }
 loadProfile(): void {
  this.userService.getProfileInfo().subscribe({
    next: (user) => {
      console.log('Profile:', user);
      this.userService.setUser(user); // ако искаш да пазиш потребителя
    },
    error: (err) => {
      console.error('Грешка при взимане на профил:', err);
      this.userService.clearUser();
    }
  });
}

  sidebarVisible = true;
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
  showDropdown = false;
  onNotifClick() {
    console.log('🔔 Камбанката беше натисната');
  }

  onProfileClick(): void {
    this.showDropdown = !this.showDropdown;
    console.log('Dropdown toggled:', this.showDropdown);
  }


  logout(): void {
    this.showDropdown=false
    this.userService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
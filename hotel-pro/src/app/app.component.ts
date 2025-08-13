import { Component, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { UserService } from './services/user.service';
import { NotifyDropdownComponent } from './notify/notify-dropdown.component'; // <-- standalone компонент (пътя нагласи при теб)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NotifyDropdownComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('slideSidebar', [
      state('in', style({ transform: 'translateX(0%)' })),
      state('out', style({ transform: 'translateX(-100%)' })),
      transition('in <=> out', animate('250ms ease-in-out'))
    ])
  ]
})
export class AppComponent {
  title = 'hotel-pro';
  sidebarVisible = true;
  openMenu: string | null = null;

  profileDropdownOpen = false;
  notifDropdownOpen = false;

  constructor(
    public userService: UserService,
    private router: Router,
    private eRef: ElementRef
  ) {}

  // Sidebar
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  // Left menu accordions
  toggleMenu(menuName: string) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  // Topbar: notifications & profile
  toggleNotifications() {
    this.notifDropdownOpen = !this.notifDropdownOpen;
    if (this.notifDropdownOpen) this.profileDropdownOpen = false;
  }

  toggleProfileMenu() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    if (this.profileDropdownOpen) this.notifDropdownOpen = false;
  }

  // Auth helpers
  loadProfile() {
    this.userService.getProfileInfo().subscribe({
      next: (user) => this.userService.setUser(user),
      error: () => this.userService.clearUser()
    });
  }

  logout() {
    this.profileDropdownOpen = false;
    this.notifDropdownOpen = false;
    this.userService.logout().subscribe(() => this.router.navigate(['/dashboard']));
  }

  isLoggedIn() {
    return this.userService.isLogged;
  }

  // Auto-close dropdowns on outside click
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: Event) {
    if (!this.eRef.nativeElement.contains(ev.target)) {
      this.profileDropdownOpen = false;
      this.notifDropdownOpen = false;
    }
  }
}

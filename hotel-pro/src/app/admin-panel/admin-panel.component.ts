import { Component } from '@angular/core';
import { UserForAuth } from '../types/user';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule],
  templateUrl: './admin-panel.components.html',
  styleUrl: './admin-panel.components.css'
})
export class AdminPanelComponent {
  users: UserForAuth[] = [];
  isForbidden = false;
  isLoading = true;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        if (err.status === 403) {
          this.isForbidden = true;
        } else {
          console.error('Грешка при зареждане на потребители:', err);
        }
        this.isLoading = false;
      }
    });
  }

}

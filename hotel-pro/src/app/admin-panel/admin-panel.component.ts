import { Component, OnInit } from '@angular/core';
import { UserForAuth } from '../types/user';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.components.html',
  styleUrl: './admin-panel.components.css'
})
export class AdminPanelComponent implements OnInit {
  users: UserForAuth[] = [];
  currentUserId: string | null = null;
  currentUserRole: string | null = null;
  isForbidden = false;
  isLoading = true;

  constructor(private userService: UserService, private router: Router) { }
  searchTerm = '';

  lastUpdatedUserId: string | null = null;
  sortField: string = 'username';
  sortAsc: boolean = true;

  sortBy(field: keyof UserForAuth) {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.filteredUsers.sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  get filteredUsers(): UserForAuth[] {
    if (!this.searchTerm.trim()) return this.users;
    const term = this.searchTerm.toLowerCase();
    return this.users.filter(user =>
      (user.email?.toLowerCase() || '').includes(term) ||
      (user.username?.toLowerCase() || '').includes(term)
    );
  }

  ngOnInit(): void {
    // 🔐 Вземи профила на текущия потребител
    this.userService.getProfileInfo().subscribe({
      next: (profile) => {
        this.currentUserId = profile._id;
        this.currentUserRole = profile.role ?? 'user';

        if (profile.role === 'admin') {
          // ✅ Зареди всички потребители само ако е админ
          this.userService.getAllUsers().subscribe({
            next: (data) => {
              this.users = data;
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Грешка при зареждане на потребители:', err);
              this.isLoading = false;
            }
          });
        } else {
          // 🚫 Не е админ — няма достъп
          this.isForbidden = true;
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Грешка при зареждане на профил:', err);
        this.isForbidden = true;
        this.isLoading = false;
      }
    });
  }

  confirmRoleChange(userId: string, newRole: 'admin' | 'user') {
    const action = newRole === 'admin' ? 'назначите за админ' : 'премахнете правата на админ';
    const confirmed = confirm(`Сигурни ли сте, че искате да ${action}?`);

    if (confirmed) {
      this.changeUserRole(userId, newRole);
    }
  }
  goToEditUser(userId: string): void {
    this.router.navigate(['/users', userId, 'edit-profile']);
  }

  changeUserRole(userId: string, newRole: 'admin' | 'user') {
    const user = this.users.find(u => u._id === userId);

    if (!user) {
      console.error(`❌ Не е намерен потребител с ID: ${userId}`);
      return;
    }

    console.log(`📤 Изпращам заявка за смяна на роля:`, {
      username: user.username,
      email: user.email,
      role: newRole
    });

    this.userService.updateUser(userId, {
      username: user.username,
      email: user.email,
      role: newRole
    }).subscribe({
      next: (updatedUser) => {
        console.log('✅ Обновен потребител:', updatedUser);

        const index = this.users.findIndex(u => u._id === userId);
        if (index !== -1) {
          this.users[index].role = updatedUser.role;
        }
      },
      error: (err) => {
        console.error('❌ Грешка при смяна на роля:', err);
      }
    });
  }

}

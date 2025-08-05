import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  // Ако си с Standalone компоненти, добави:
  // standalone: true,
   imports: [CommonModule,]
})
export class ProfileComponent implements OnInit {
  user: any = null;
  error: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getProfileInfo();
  }

  getProfileInfo() {
    this.http.get('http://localhost:3000/api/users/profile', { withCredentials: true })
      .subscribe({
        next: (user: any) => {
          this.user = user;
          this.error = '';
          console.log('Profile data:', user); // за дебъг
        },
        error: err => {
          this.user = null;
          this.error = err.error?.message || 'Неуспешна заявка';
          console.log('Profile error:', err);
        }
      });
  }
}

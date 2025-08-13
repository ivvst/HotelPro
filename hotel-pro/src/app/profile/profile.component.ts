import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../services/user.service';
import { UserDetailed } from '../types/user';
import { TrimPipe } from './trim.pipe';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  // standalone: true,
  imports: [CommonModule,TrimPipe],
  styleUrl:'./profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserDetailed | null = null;
  error = '';
  loading = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
  this.loading = true;
  this.userService.getProfileInfo().subscribe({
    next: (user: UserDetailed) => {
      this.user = user;
      this.error = '';
      this.loading = false;
    },
    error: (err: unknown) => {
      this.user = null;
      this.loading = false;
      this.error = err instanceof HttpErrorResponse
        ? (err.error?.message as string) || 'Неуспешна заявка'
        : 'Неуспешна заявка';
    },
  });
}
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    repeatPassword: ''
  };

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  onSubmit(): void {
    const { username, fullName, email, password, repeatPassword } = this.formData;

    if (password !== repeatPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.userService
      .register(username, email, password, repeatPassword, fullName)
      .subscribe({
        next: () => this.router.navigate(['/']),
        error: (err) => alert(err.error?.message || 'Registration failed'),
      });
  }
  onLinkClick() {
    this.router.navigate(['/login']);
    console.log('Login link clicked');
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid) return;

    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;

    this.userService.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        const message = err?.error?.message || 'Login failed';
        alert(message);
      }
    });
  }
   onLinkClick() {
    this.router.navigate(['/register']);
    console.log('Register link clicked');
  }
}

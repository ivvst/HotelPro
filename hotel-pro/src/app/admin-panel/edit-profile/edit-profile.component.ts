import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // ✅ добавено Router
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { UserForAuth } from '../../types/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-edit-profile',
    imports: [CommonModule, FormsModule],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
    userId: string | null = null;
    user: UserForAuth | null = null;

    username = '';
    email = '';
    tel = '';
    role: 'user' | 'admin' = 'user';

    isAdmin = false;
    successMsg = '';
    errorMsg = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router, // ✅ добавено
        private userService: UserService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.userId = this.route.snapshot.paramMap.get('id');
        this.isAdmin = this.userService.role === 'admin';

        if (this.userId) {
            this.userService.getUserById(this.userId).subscribe({
                next: (user) => {
                    this.user = user;
                    this.username = user.username;
                    this.email = user.email;
                    this.role = user.role || 'user';
                },
                error: () => {
                    this.errorMsg = '⚠️ Потребителят не беше намерен.';
                }
            });
        } else {
            this.userService.getProfileInfo().subscribe({
                next: (user) => {
                    this.user = user;
                    this.username = user.username;
                    this.email = user.email;
                    this.role = user.role || 'user';
                },
                error: () => {
                    this.errorMsg = '⚠️ Грешка при зареждане на профила.';
                }
            });
        }
    }

    onUpdateProfile(): void {
        const payload = {
            username: this.username,
            email: this.email,
            role: this.role
        };

        const req = this.userId
            ? this.userService.updateUserById(this.userId, payload)
            : this.userService.updateProfile(this.username, this.email, this.role);

        req.subscribe({
            next: () => {
                this.successMsg = '✅ Успешно обновен профил!';
                this.errorMsg = '';

                // ✅ автоматично връщане след 1.5 сек.
                setTimeout(() => {
                    this.router.navigate(['/users']);
                }, 1500);
            },
            error: () => {
                this.errorMsg = '❌ Грешка при обновяването.';
                this.successMsg = '';
            }
        });
    }

    onCancel(): void { // ✅ добавен метод за Cancel бутон
        this.router.navigate(['/users']);
    }
}

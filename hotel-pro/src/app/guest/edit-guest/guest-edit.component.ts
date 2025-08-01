import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Guest } from '../../types/guests';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Cruise } from '../../types/cruise';
import { CruiseService } from '../../services/cruise.service';

@Component({
    selector: 'app-guest-edit',
    templateUrl: './guest-edit.component.html',
    styleUrls: ['./guest-edit.component.css'],
    standalone: true,
    imports: [FormsModule, CommonModule]
    // standalone: true, imports: [...],TODO
})
export class GuestEditComponent implements OnInit {
    guest!: Guest;
    cruises: Cruise[] = [];

    constructor(
        private route: ActivatedRoute,
        private guestService: GuestService,
        private cruiseService: CruiseService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit() {
        const guestId = this.route.snapshot.paramMap.get('id');
        if (guestId) {
            this.guestService.getGuestById(guestId).subscribe((g: Guest) => {
                this.guest = g;
            });
        }

        this.cruiseService.getAllCruises().subscribe((cruises: Cruise[]) => {
            this.cruises = cruises;
        });
    }

    getCruiseNameById(id: string): string {
        return this.cruises.find(c => c._id === id)?.name || '';
    }

    onSubmit(f: NgForm) {
        if (f.invalid) return;
        this.guestService.updateGuest(this.guest._id!, this.guest).subscribe({
            next: () => {
                this.snackBar.open('Промените са запазени!', 'Затвори', { duration: 3000 });
                this.router.navigate(['/room'], { queryParams: { cruise: this.guest.cruiseId } });
            },
            error: () => {
                this.snackBar.open('Възникна грешка при запис.', 'Затвори', { duration: 3000 });
            }
        });
    }

    onCancel() {
        this.router.navigate(['/room'], { queryParams: { cruise: this.guest.cruiseId } });
    }
}
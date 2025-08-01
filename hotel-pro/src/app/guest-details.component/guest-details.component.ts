import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GuestService } from '../services/guest.service';
import { CruiseService } from '../services/cruise.service';
import { Cruise } from '../types/cruise'; // създай тези типове в /types
import { Guest } from '../types/guests';
import { Excursion } from '../types/excursion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-details',
  templateUrl: './guest-details.component.html',
  styleUrls: ['./guest-details.component.css'],
  standalone: true,
  imports: [FormsModule,CommonModule]
})
export class GuestDetailsComponent implements OnInit {
  guest: Guest | null = null;
  cruise: Cruise | null = null;
  showDropdown = false;
  selectedExcursionId = '';

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService,
    private cruiseService: CruiseService
  ) {}

  ngOnInit() {
    const guestId = this.route.snapshot.paramMap.get('id');
    if (!guestId) {
      // Може да покажеш грешка или да пренасочиш
      return;
    }

    this.guestService.getGuestById(guestId).subscribe(guest => {
      this.guest = guest;
      if (guest.cruiseId) {
        this.cruiseService.getCruiseById(guest.cruiseId).subscribe(cruise => {
          this.cruise = cruise;
        });
      }
    });
  }

  addExcursionToGuest() {
    if (!this.guest || !this.selectedExcursionId) return;
    const ex = this.cruise?.excursions.find(e => e._id === this.selectedExcursionId);
    if (!ex) return;
    this.guestService.addExcursionToGuest(this.guest._id!, ex._id!, ex.name).subscribe(updatedGuest => {
      this.guest = updatedGuest;
      this.selectedExcursionId = '';
      this.showDropdown = false;
    });
  }

  removeExcursionFromGuest(excursionId: string) {
    if (!this.guest || !this.guest._id) return;
    this.guestService.removeExcursionFromGuest(this.guest._id, excursionId).subscribe(updatedGuest => {
      this.guest = updatedGuest;
    });
  }

  isExcursionAlreadyAdded(exId: string): boolean {
  return !!this.guest?.excursions.find(gex => gex._id === exId);
}
}
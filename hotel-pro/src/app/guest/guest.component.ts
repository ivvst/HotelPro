import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Guest } from '../types/guests';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestComponent {
  isHovered = false;

  // Hardcoded примерни данни
  guest = {
    level: 7,
    firstName: 'Ivan',
    lastName: 'Ivanov',
    roomNumber: 102,
    birthDate: '1990-05-18',
    nationality: 'Bulgarian',
    email: 'ivan@example.com',
    stayFrom: '2025-07-20',
    stayTo: '2025-07-27',
    excursions: ['Beach Tour', 'Mountain Hike'],
    isVIP: true,
    isRhc: false,
    photoUrl: 'https://bootdey.com/img/Content/avatar/avatar1.png'
  };
}

// export class GuestComponent implements OnChanges {
//   @Input() guest!: Guest;

//   ngOnChanges(changes: SimpleChanges): void {
//     console.log('Rendering guest:', this.guest);
//   }
// }

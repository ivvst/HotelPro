import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { GuestService } from '../../services/guest.service';
import { Guest } from '../../types/guests';  // Импортиране на тип Guest
import { Room } from '../../types/room';    // Импортиране на тип Room
import { Cruise } from '../../types/cruise';  // Импортиране на тип Cruise
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CruiseService } from '../../services/cruise.service';

@Component({
  selector: 'app-guest-add',
  templateUrl: './guest-add.component.html',
  styleUrls: ['./guest-add.component.css'],
  imports: [FormsModule, CommonModule, RouterModule, NgSelectModule],
})
export class GuestAddComponent implements OnInit {
  guest: Guest = {
    firstName: '',
    lastName: '',
    roomNumber: 0,
    birthDate: '',
    nationality: '',
    email: '',
    stayFrom: '',
    stayTo: '',
    excursions: [],
    isVIP: false,
    vipServices: [],
    isRhc: false,
    cruiseId: '',
    picture: ''
  };

  constructor(private route: ActivatedRoute, private router: Router,
    private guestService: GuestService,
    private cruiseService: CruiseService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    const roomNumber = this.route.snapshot.queryParamMap.get('room');
    const cruiseId = this.route.snapshot.queryParamMap.get('cruise');
    if (roomNumber) this.guest.roomNumber = +roomNumber;
    if (cruiseId) this.guest.cruiseId = cruiseId;
    console.log(cruiseId);
    
    
    

    this.cruiseService.getCruiseById(cruiseId!).subscribe((cruise) => {
      // Сетни автоматично датите за престоя на госта
      this.guest.stayFrom = cruise.startDate;
      console.log(cruise.startDate);
      
      this.guest.stayTo = cruise.endDate;
    });
  }

  onCancel() {
    // Ако искаш да се върнеш към предишния cruise с конкретен id:

    this.router.navigate(['room']);
  }

  onSubmit(f: NgForm) {
    if (f.invalid) return;

    // Ако имаш GuestService и бекенд:
    this.guestService.createGuest(this.guest).subscribe({
      next: () => {
        this.snackBar.open('Гостът беше успешно добавен!', 'Затвори', { duration: 3500 });
        f.resetForm();
        this.router.navigate(['/cruise']);
      },
      error: (err) => {
        let userMessage = 'Възникна неочаквана грешка. Моля, опитайте отново.';
        if (err && err.error) {
          const serverMsg = typeof err.error === 'string'
            ? err.error
            : err.error.message || err.error.error || '';
          if (
            serverMsg.toLowerCase().includes('email') &&
            (serverMsg.toLowerCase().includes('already') ||
              serverMsg.toLowerCase().includes('зает') ||
              serverMsg.toLowerCase().includes('exists') ||
              serverMsg.toLowerCase().includes('duplicate'))
          ) {
            userMessage = 'Този имейл вече съществува. Моля, въведете друг имейл адрес.';
          }
        }
        this.snackBar.open(userMessage, 'Затвори', { duration: 5000 });
      }
    });

  }

}

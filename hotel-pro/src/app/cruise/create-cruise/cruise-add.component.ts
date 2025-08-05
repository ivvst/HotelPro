import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CruiseService } from '../../services/cruise.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cruise-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cruise-add.component.html',
  styleUrl:'./cruise-add.component.css'
})
export class CruiseAddComponent {
  cruiseData = {
    name: '',
    startDate: '',
    endDate: ''
  };

  successMsg = '';
  errorMsg = '';

  constructor(private cruiseService: CruiseService, private router: Router) { }

  submit() {
    const start = new Date(this.cruiseData.startDate);
    const end = new Date(this.cruiseData.endDate);
    if (end < start) {
      this.errorMsg = 'End date cannot be before the start date';
      setTimeout(() => (this.errorMsg = ''), 3000);
      return;
    }

    this.cruiseService.addCruise(this.cruiseData).subscribe({
      next: () => {
        this.successMsg = 'Круизът е добавен успешно!';
        setTimeout(() => {
          this.router.navigate(['/cruise']); // пренасочване към списъка
        }, 1000);
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Грешка при добавяне на круиз';
        setTimeout(() => (this.errorMsg = ''), 3000);
      }
    });
  }
}

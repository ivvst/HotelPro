import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { Cruise } from '../../types/cruise';
import { CruiseService } from '../../services/cruise.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cruise-add',
  templateUrl: './cruise-add.component.html',
  styleUrls: ['./cruise-add.component.css'],
  imports:[FormsModule,CommonModule]
})
export class CruiseAddComponent {
  cruise: Partial<Cruise> = {
    name: '',
    startDate: '',
    endDate: '',
    excursions: [],
  };

  constructor(
    private cruiseService: CruiseService,
    private router: Router
  ) {}

  onSubmit(f: NgForm) {
    if (f.invalid) return;
    this.cruiseService.addCruise(this.cruise).subscribe({
      next: () => {
        this.router.navigate(['/cruise']);
      }
    });
  }
}

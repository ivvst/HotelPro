import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CruiseService } from '../../services/cruise.service';
import { FormsModule, NgForm } from '@angular/forms';
import { Cruise } from '../../types/cruise';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cruise-edit',
  templateUrl: './cruise-edit.component.html',
  styleUrls: ['./cruise-edit.component.css'],
  imports:[FormsModule,CommonModule]
})
export class CruiseEditComponent implements OnInit {
  cruise!: Cruise;

  constructor(
    private route: ActivatedRoute,
    private cruiseService: CruiseService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cruiseService.getCruiseById(id).subscribe((c: Cruise) => {
        this.cruise = c;
      });
    }
  }

  onSubmit(f: NgForm) {
    if (f.invalid) return;
    this.cruiseService.updateCruise(this.cruise._id, this.cruise).subscribe({
      next: () => {
        this.router.navigate(['/cruise']);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/cruise']);
  }
}

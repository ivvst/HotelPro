import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CruiseService } from '../../services/cruise.service';
import { Excursion } from '../../types/excursion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-excursion-list',
  templateUrl: './excursion-list.component.html',
  styleUrls: ['./excursion-list.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule]
})
export class ExcursionListComponent implements OnInit {
  @Input() cruiseId?: string;
  excursions: Excursion[] = [];
  loading = false;
  error = '';
  editExcursion: Excursion | null = null;

  // Само с един интерфейс, _id е optional
  formData: Excursion = {
    name: '',
    date: '',
    fromTime: '',
    toTime: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private cruiseService: CruiseService
  ) {}

  ngOnInit() {
    if (!this.cruiseId) {
      this.cruiseId = this.route.snapshot.paramMap.get('id') || undefined;
    }
    if (this.cruiseId) {
      this.loadExcursions();
    }
  }

  loadExcursions() {
    if (!this.cruiseId) return;
    this.loading = true;
    this.cruiseService.getCruiseById(this.cruiseId).subscribe({
      next: cruise => {
        this.excursions = cruise.excursions || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Проблем с извличането на екскурзиите';
        this.loading = false;
      }
    });
  }

  submit() {
    if (!this.cruiseId) return;
    if (this.editExcursion) {
      // Редакция
      this.cruiseService.updateExcursion(
        this.cruiseId,
        this.editExcursion._id!, // ! защото сме сигурни, че го има при редакция
        {
          name: this.formData.name,
          date: this.formData.date,
          fromTime: this.formData.fromTime,
          toTime: this.formData.toTime,
          description: this.formData.description
        }
      ).subscribe(() => {
        this.loadExcursions();
        this.editExcursion = null;
        this.resetForm();
      });
    } else {
      // Добавяне
      this.cruiseService.addExcursion(
        this.cruiseId,
        {
          name: this.formData.name,
          date: this.formData.date,
          fromTime: this.formData.fromTime,
          toTime: this.formData.toTime,
          description: this.formData.description
        }
      ).subscribe(() => {
        this.loadExcursions();
        this.resetForm();
      });
    }
  }

  startEdit(ex: Excursion) {
    this.editExcursion = ex;
    this.formData = {
      _id: ex._id, // няма да се подаде при add
      name: ex.name,
      date: ex.date,
      fromTime: ex.fromTime,
      toTime: ex.toTime,
      description: ex.description
    };
  }

  deleteExcursion(id: string) {
    if (!this.cruiseId) return;
    if (!confirm('Сигурен ли си, че искаш да изтриеш тази екскурзия?')) return;
    this.cruiseService.deleteExcursion(this.cruiseId, id).subscribe(() => {
      this.loadExcursions();
    });
  }

  cancelEdit() {
    this.editExcursion = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      date: '',
      fromTime: '',
      toTime: '',
      description: ''
    };
  }
}

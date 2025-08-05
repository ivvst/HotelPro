import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CruiseService } from '../../services/cruise.service';
import { Excursion } from '../../types/excursion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service'; // <-- СМЯНА
import { ShortenPipe } from '../../pipes/shorten.pipes';

@Component({
  selector: 'app-excursion-list',
  templateUrl: './excursion-list.component.html',
  styleUrls: ['./excursion-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ShortenPipe]
})
export class ExcursionListComponent implements OnInit {

  @Input() cruiseId?: string;
  excursions: Excursion[] = [];
  loading = false;
  error = '';
  successMsg = '';
  errorMsg = '';
  editExcursion: Excursion | null = null;
  isAdmin = false;
  userRole?: string;

  formData: Excursion = {
    name: '',
    date: '',
    fromTime: '',
    toTime: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private cruiseService: CruiseService,
    private userService: UserService // <-- СМЯНА
  ) { }

  ngOnInit() {
    // Реактивна проверка за роля
    this.userService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.userRole = user?.role;
      console.log('Потребителят админ ли е?', this.isAdmin);
      if (this.userRole) {
        console.log('Ролята на потребителя е:', this.userRole);
      } else {
        console.log('Потребителят няма зададена роля.', this.userRole);
      }
    });

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
        this.error = '';
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
        this.editExcursion._id!,
        {
          name: this.formData.name,
          date: this.formData.date,
          fromTime: this.formData.fromTime,
          toTime: this.formData.toTime,
          description: this.formData.description
        }
      ).subscribe({
        next: () => {
          this.successMsg = 'Екскурзията е редактирана успешно!';
          this.loadExcursions();
          this.editExcursion = null;
          this.resetForm();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          this.errorMsg = err.error?.message || 'Грешка при редакция!';
          setTimeout(() => this.errorMsg = '', 3000);
        }
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
      ).subscribe({
        next: () => {
          this.successMsg = 'Екскурзията е добавена успешно!';
          this.loadExcursions();
          this.resetForm();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          this.errorMsg = err.error?.message || 'Грешка при добавяне!';
          setTimeout(() => this.errorMsg = '', 3000);
        }
      });
    }
  }

  startEdit(ex: Excursion) {
    this.editExcursion = ex;
    this.formData = {
      _id: ex._id,
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
    this.cruiseService.deleteExcursion(this.cruiseId, id).subscribe({
      next: (res: { message: string }) => {
        this.successMsg = res.message || 'Екскурзията беше изтрита!';
        this.loadExcursions();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Грешка при изтриване!';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

  requestDelete(id: string | undefined) {
    if (!this.cruiseId || !id) return;
    console.log('Ще изпратя заявка за изтриване:', this.cruiseId, id);

    this.cruiseService.requestExcursionDelete(this.cruiseId, id)
      .subscribe({
        next: (res: { message: string }) => {
          console.log('Отговорът от бекенда:', res);

          this.successMsg = res.message || 'Заявката за изтриване е изпратена!';
          this.loadExcursions();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          console.log('Грешка при заявка за изтриване:', err);
          this.errorMsg = err.error?.message || 'Грешка при заявка за изтриване!';
          setTimeout(() => this.errorMsg = '', 3000);
        }
      });
  }
  rejectDelete(id: string | undefined) {
    if (!this.cruiseId || !id) return;
    this.cruiseService.rejectExcursionDelete(this.cruiseId, id)
      .subscribe({
        next: (res: { message: string }) => {
          this.successMsg = res.message || 'Заявката за изтриване е отказана!';
          this.loadExcursions();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          this.errorMsg = err.error?.message || 'Грешка при отказ!';
          setTimeout(() => this.errorMsg = '', 3000);
        }
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
      description: '',
    };
  }
}

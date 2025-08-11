import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CruiseService } from '../../services/cruise.service';
import { GuestService } from '../../services/guest.service';
import { Excursion } from '../../types/excursion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ShortenPipe } from '../../pipes/shorten.pipes';
import { Guest } from '../../types/guests';

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

  guestsByExcursion: Record<string, Guest[]> = {};
  loadingGuests: Record<string, boolean> = {};
  errorByExcursion: Record<string, string> = {};
  expanded: Record<string, boolean> = {};

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
    private userService: UserService,
    private guestService: GuestService
  ) { }

  ngOnInit() {
    this.userService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.userRole = user?.role;
    });

    if (!this.cruiseId) {
      this.cruiseId = this.route.snapshot.paramMap.get('id') || undefined;
    }
    if (this.cruiseId) {
      this.loadExcursions();
    }
  }

  toggleGuests(exId?: string) {
    if (!exId) return;
    const safeId = String(exId);
    const willExpand = !this.expanded[safeId];
    this.expanded[safeId] = willExpand;

    if (willExpand && !this.guestsByExcursion[safeId]) {
      this.fetchGuests(safeId);
    }
  }

  fetchGuests(exId: string) {
    const safeId = String(exId);
    this.loadingGuests[safeId] = true;
    this.errorByExcursion[safeId] = '';

    this.guestService.getGuestsByExcursionId(safeId).subscribe({
      next: (gs) => {
        this.guestsByExcursion[safeId] = (gs || []).map(g => ({
          ...g,
          _id: String(g._id)
        }));
        this.loadingGuests[safeId] = false;
      },
      error: (err) => {
        this.errorByExcursion[safeId] =
          err?.error?.error || err?.error?.message || err.message || 'Error';
        this.loadingGuests[safeId] = false;
      }
    });
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

  updateExcursionCapacity(exId: string, newCap: number): void {
    if (!this.cruiseId || !exId) return;

    this.cruiseService.updateCapacity(this.cruiseId, exId, newCap).subscribe({
      next: (res: { message: string; capacity: number }) => {
        // намираме екскурзията и обновяваме локално
        const ex = this.excursions.find(e => e._id === exId);
        if (ex) ex.capacity = res.capacity;
        this.successMsg = 'Капацитетът е обновен успешно!';
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: err => {
        this.errorMsg = err.error?.message || 'Грешка при обновяване на капацитета!';
        setTimeout(() => this.errorMsg = '', 3000);
      }
    });
  }

saveCapacity(ex: Excursion, event: Event): void {
  const input = event.target as HTMLInputElement;
  let newCap = Number(input.value);

  // Минимум 1, за да няма 0 или отрицателни
  if (isNaN(newCap) || newCap < 1) {
    newCap = 1;
    input.value = '1';
  }

  this.cruiseService.updateCapacity(this.cruiseId!, ex._id!, newCap).subscribe({
    next: res => {
      ex.capacity = newCap; // веднага обновява локалния обект
      this.successMsg = `Капацитетът е променен на ${newCap}`;
      setTimeout(() => this.successMsg = '', 3000);
    },
    error: err => {
      this.errorMsg = 'Грешка при запис на капацитет';
      console.error(err);
    }
  });
}



  submit() {
    if (!this.cruiseId) return;
    if (this.editExcursion) {
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
    this.formData = { ...ex };
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

  requestDelete(id?: string) {
    if (!this.cruiseId || !id) return;
    this.cruiseService.requestExcursionDelete(this.cruiseId, id)
      .subscribe({
        next: (res: { message: string }) => {
          this.successMsg = res.message || 'Заявката за изтриване е изпратена!';
          this.loadExcursions();
          setTimeout(() => this.successMsg = '', 3000);
        },
        error: err => {
          this.errorMsg = err.error?.message || 'Грешка при заявка за изтриване!';
          setTimeout(() => this.errorMsg = '', 3000);
        }
      });
  }

  rejectDelete(id?: string) {
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

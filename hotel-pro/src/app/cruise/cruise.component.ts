import { Component, signal, computed, OnInit, NgModule } from '@angular/core';
import { CruiseService } from '../services/cruise.service';
import { Cruise } from '../types/cruise';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GuestService } from '../services/guest.service';
import { Guest } from '../types/guests';
import { ExcursionListComponent } from './excursion/excursion-list.component';
import { LoaderService } from '../services/loaded.service';
import { FormsModule } from '@angular/forms';

@Component({
  providers: [CruiseService],
  selector: 'app-cruises',
  standalone: true,
  imports: [CommonModule, ExcursionListComponent,FormsModule],
  templateUrl: './cruise.component.html',
  styleUrl: './cruise.component.css'
})
export class CruisesComponent implements OnInit {

  cruises = signal<Cruise[]>([]);   // WritableSignal
  guests = signal<Guest[]>([]);     // WritableSignal

  guestsView = signal(false);
  detailsView = signal(false);
  selectedCruise = signal<Cruise | null>(null);

  editMode = false;
  saving = false;
  private editingId: string | null = null;

  // моделът за редакция (частичен Cruise, без any)
  editModel: Partial<Cruise> = {};

  readonly MAX_GUESTS = 100;

  constructor(
    private cruiseService: CruiseService,
    private guestService: GuestService,
    private router: Router,
    public loader: LoaderService
  ) { }

  ngOnInit() {
    this.loader.show(); // ⏳ Покажи loader преди заявките

    // Зареждане на круизи
    this.cruiseService.getAllCruises().subscribe({
      next: (c) => this.cruises.set(c),
      error: (err) => console.error(err),
      complete: () => this.loader.hide() // ✅ Скрий след завършване
    });

    // Зареждане на гости
    this.guestService.getAllGuests().subscribe({
      next: (g) => this.guests.set(g),
      error: (err) => console.error(err)
      // 👈 Тук няма loader.hide(), защото вече го извикахме отгоре
    });
  }

  // Pagination
  page = signal(1);
  pageSize = 10;

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.cruises().length / this.pageSize))
  );
  pagedCruises = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.cruises().slice(start, start + this.pageSize);
  });

  // Helpers
  getGuestCount(cruiseId?: string): number {
    if (!cruiseId) return 0;
    return this.guests().filter(g => g.cruiseId === cruiseId).length;
  }

  getFilledPercent(cruiseId: string): number {
    return Math.round(this.getGuestCount(cruiseId) / this.MAX_GUESTS * 100);
  }

  getExcursionCount(cruise: Cruise): number {
    return cruise.excursions?.length || 0;
  }

  // Pagination controls
  nextPage() {
    if (this.page() < this.totalPages()) this.page.update(v => v + 1);
  }

  prevPage() {
    if (this.page() > 1) this.page.update(v => v - 1);
  }

  setPage(p: number) {
    if (p >= 1 && p <= this.totalPages()) this.page.set(p);
  }

  // Track by
  trackById = (_: number, cruise: Cruise) => cruise._id;

  // Check guests
  checkGuests(cruiseId: string) {
    this.router.navigate(['/catalog'], { queryParams: { cruise: cruiseId } });
  }

  showDetails(cruise: Cruise) {
    this.selectedCruise.set(cruise);
    this.detailsView.set(true);
    this.guestsView.set(false);
  }

  backToCruises() {
    this.guestsView.set(false);
    this.detailsView.set(false);
    this.selectedCruise.set(null);

    // 🔄 Презареждане на круизите при връщане назад
    this.cruiseService.getAllCruises().subscribe(c => this.cruises.set(c));
  }

  addCruise() {
    this.router.navigate(['/cruise/add']);
  }

  startEdit(cruise: Cruise): void {
    // ако не си в детайли, покажи ги
    if (!this.selectedCruise() || this.selectedCruise()?._id !== cruise._id) {
      this.showDetails(cruise);
    }

    this.editingId = cruise._id!;
    this.editModel = {
      name: cruise.name,
      startDate: cruise.startDate,
      endDate: cruise.endDate
    };
    this.editMode = true;
  }

  /** Отказ от редакция */
  cancelEdit(): void {
    this.editMode = false;
    this.editingId = null;
    this.editModel = {};
  }

  /** Запази промените – извикваш твоя updateCruise */
  saveEdit(): void {
    if (!this.editingId) return;

    // минимална валидация
    const payload: Partial<Cruise> = {
      name: this.editModel.name?.trim() || undefined,
      startDate: this.editModel.startDate,
      endDate: this.editModel.endDate
    };

    this.saving = true;
    this.cruiseService.updateCruise(this.editingId, payload).subscribe({
      next: (updated: Cruise) => {
        // ако показваме детайлите на същия круиз – актуализираме локално
        if (this.selectedCruise() && this.selectedCruise()?._id === updated._id) {
          // ако имаш setter за selectedCruise, ползвай него.
          // Ако selectedCruise() чете от масив, увери се, че списъкът се рефрешва от refreshCruises().
        }
        this.saving = false;
        this.editMode = false;
        this.editingId = null;
        this.editModel = {};
        // списъкът така или иначе се рефрешва от tap(refreshCruises()) в service
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  /** Потвърждение и изтриване – ползваш твоя deleteCruise */
  confirmDeleteCruise(cruise: Cruise): void {
    const ok = window.confirm(`Delete cruise "${cruise.name}"?`);
    if (!ok) return;

    this.saving = true;
    this.cruiseService.deleteCruise(cruise._id!).subscribe({
      next: () => {
        this.saving = false;
        // ако трием избрания круиз – върни се към списъка
        if (this.selectedCruise() && this.selectedCruise()?._id === cruise._id) {
          this.backToCruises();
        }
        // списъкът ще се обнови от refreshCruises()
      },
      error: () => {
        this.saving = false;
      }
    });
  }

}

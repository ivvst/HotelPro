import { Component, inject, Signal, signal, computed } from '@angular/core';
import { CruiseService } from '../services/cruise.service';
import { Cruise } from '../types/cruise';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { GuestService } from '../services/guest.service';
import { Guest } from '../types/guests';
import { ExcursionListComponent } from './excursion/excursion-list.component';

@Component({
  providers: [CruiseService],
  selector: 'app-cruises',
  standalone: true,
  imports: [CommonModule,ExcursionListComponent],
  templateUrl: './cruise.component.html',
  styleUrl: './cruise.component.css'
})
export class CruisesComponent {

  cruises: Signal<Cruise[]> = toSignal(inject(CruiseService).getAllCruises(), { initialValue: [] });
  guests: Signal<Guest[]> = toSignal(inject(GuestService).getAllGuests(), { initialValue: [] });

  guestsView = signal(false);
  detailsView = signal(false);
  selectedCruise = signal<Cruise | null>(null);

  readonly MAX_GUESTS = 100;

  constructor(
    private cruiseService: CruiseService,
    private router: Router
  ) { }
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
  }

  addCruise() {
    this.router.navigate(['/cruise/add']);
  }
}

// catalog.component.ts
import { Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { GuestService } from '../services/guest.service';
import { CruiseService } from '../services/cruise.service';
import { Guest } from '../types/guests';
import { Cruise } from '../types/cruise';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './catalog.component.html',
  styleUrl:'./catalog.component.css'
})
export class CatalogComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guests: Signal<Guest[]> = toSignal(
    inject(GuestService).getAllGuests(),
    { initialValue: [], requireSync: false }
  );
  cruises: Signal<Cruise[]> = toSignal(
    inject(CruiseService).getAllCruises(),
    { initialValue: [], requireSync: false }
  );

  // РЕАКТИВЕН сигнал за избрания круиз (взет от query параметъра)
cruiseId: Signal<string | null> = toSignal(
  this.route.queryParamMap.pipe(
    map(params => params.get('cruise') ?? null)
  ),
  { initialValue: null }
) as Signal<string | null>;

  // Филтрирани гости според избрания круиз
search = '';
filteredGuests() {
  return this.guests().filter(g =>
    (!this.cruiseId() || g.cruiseId === this.cruiseId()) &&
    (g.firstName + ' ' + g.lastName).toLowerCase().includes(this.search.toLowerCase())
  );
}

  // Филтрирай при избор от drop-down, промени query параметъра
  onSelectCruise(id: string) {
    this.router.navigate([], {
      queryParams: { cruise: id || null }, // null ще премахне параметъра
      queryParamsHandling: '',
      relativeTo: this.route
    });
  
  }
  

  // Компактна trackBy функция
  trackById = (_: number, guest: Guest) => guest._id;

  getCruiseNameById(id: string, cruises: Cruise[]): string {
    return cruises.find(c => c._id === id)?.name || '';
  }
  
}

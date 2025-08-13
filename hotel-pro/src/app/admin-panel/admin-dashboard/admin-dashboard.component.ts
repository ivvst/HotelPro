import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { GuestService } from '../../services/guest.service';
import { RoomService } from '../../services/room.service';
import { CruiseService } from '../../services/cruise.service';
import { NotifyService } from '../../services/notify.service';

import { Guest } from '../../types/guests';
import { Cruise } from '../../types/cruise';
import { Task } from '../../types/task';
import { Excursion } from '../../types/excursion';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {

  guestsList: Guest[] = [];
  cruises: Cruise[] = [];
  tasks: Task[] = [];

  activeCruiseId: string | null = null;

  stats = { guests: 0, rooms: 0, cruises: 0, occupancyPct: 0 };
  projects: {
    id: string;
    name: string;
    priority: 'low' | 'medium' | 'high';
    progressPct: number;
    teamAvatars: string[];
  }[] = [];

  readonly defaultAvatar = 'assets/avatars/default.png';
  readonly MAX_GUESTS = 20;

  constructor(
    private guestsSrv: GuestService,
    private roomsSrv: RoomService,
    private cruisesSrv: CruiseService,
    private notifySrv: NotifyService
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    forkJoin({
      guests: this.guestsSrv.getAllGuests(),
      rooms: this.roomsSrv.getAllRooms(),
      cruises: this.cruisesSrv.getAllCruises(),
      tasks: this.notifySrv.getAll()
    }).subscribe(({ guests, rooms, cruises, tasks }) => {
      this.guestsList = guests;
      this.cruises = cruises;
      this.tasks = tasks;

      this.stats.guests = guests.length;
      this.stats.rooms = rooms.length;
      this.stats.cruises = cruises.length;
      this.stats.occupancyPct = this.calcOccupancyPct(rooms);

      this.updateProjectsView();
    });
  }

  getGuestCount(cruiseId?: string): number {
    if (!cruiseId) return 0;
    return this.guestsList.filter(g => g.cruiseId === cruiseId).length;
  }

  getFilledPercent(cruiseId?: string): number {
    if (!cruiseId) return 0;
    const totalGuests = this.getGuestCount(cruiseId);
    const capacity = this.MAX_GUESTS;
    const percent = Math.round((totalGuests / capacity) * 100);
    return Math.min(100, Math.max(0, percent));
  }

  recalcForCruise(cruiseId: string | null): void {
    this.activeCruiseId = cruiseId;
    this.updateProjectsView();

    if (cruiseId) {
      this.stats.guests = this.getGuestCount(cruiseId);
      this.stats.occupancyPct = this.getFilledPercent(cruiseId);
    } else {
      this.stats.guests = this.guestsList.length;
      this.stats.occupancyPct = this.calcOccupancyPct(
        this.guestsList.map(g => ({ guests: 1 })),
        this.MAX_GUESTS
      );
    }
  }

  private updateProjectsView(): void {
    if (!this.activeCruiseId) {
      this.projects = this.tasks.map((t: Task) => ({
        id: t._id,
        name: t.username ? `${t.text} — ${t.username}` : t.text,
        priority: this.pickPriority(t),
        progressPct: t.done ? 100 : 40,
        teamAvatars: [this.defaultAvatar]
      }));
      return;
    }

    const cruise = this.cruises.find(c => c._id === this.activeCruiseId);
    if (!cruise) { this.projects = []; return; }

    this.projects = cruise.excursions.map((e: Excursion) => {
      const enrolled = this.guestsList.filter(g =>
        Array.isArray(g.excursions) && g.excursions.some(x => x._id === e._id)
      );
      const avatars = enrolled.map(g => g.picture || this.defaultAvatar);
      const capacity = e.capacity && e.capacity > 0 ? e.capacity : this.MAX_GUESTS;
      let percent = Math.round((enrolled.length / capacity) * 100);

      // ако е този конкретен круиз → ограничаваме до 100%
      console.log('=== DEBUG ===');
      console.log('Cruise:', cruise.name);
      console.log('Excursion:', e.name);
      console.log('Enrolled guests:', enrolled.length);
      console.log('Capacity:', capacity);
      console.log('Calculated percent:', (enrolled.length / capacity) * 100);



      let priority: 'low' | 'medium' | 'high' = 'low';
      if (percent >= 70) priority = 'high';
      else if (percent >= 35) priority = 'medium';

      return {
        id: e._id ?? '',
        name: e.name,
        priority,
        progressPct: percent,
        teamAvatars: avatars
      };
    });
  }

  private calcOccupancyPct(rooms: { guests?: number }[], totalCapacity = 100): number {
    if (!rooms.length) return 0;
    const totalGuests = rooms.reduce((sum, r) => sum + (r.guests || 0), 0);
    return Math.round((totalGuests / totalCapacity) * 100);
  }

  private pickPriority(t: Task): 'low' | 'medium' | 'high' {
    const s = (t.text || '').toLowerCase();
    if (t.role === 'admin' || s.includes('vip') || s.includes('спешно')) return 'high';
    if (s.includes('ремонт') || s.includes('repair')) return 'medium';
    return 'low';
  }

  badgeClass(level: 'low' | 'medium' | 'high'): string {
    return `badge ${level}`;
  }

  progressStyle(percent: number): { width: string; background: string } {
    const p = Math.max(0, Math.min(100, percent));
    const color = p >= 70 ? '#38a169' : p >= 35 ? '#dd6b20' : '#e53e3e';
    return { width: `${p}%`, background: color };
  }

  onCreate(): void {
    console.log('Create action…');
  }
}

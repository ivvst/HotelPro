import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeLevel = 'high' | 'medium' | 'low';

interface AdminStats {
  guests: number;
  rooms: number;
  cruises: number;
  occupancyPct: number; // 0..100
}

interface ProjectRow {
  id: string;
  name: string;
  iconUrl?: string;
  priority: BadgeLevel;
  progressPct: number; // 0..100
  teamAvatars: string[]; // image urls
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  // 📊 Статистики (примерни данни – вържи към API когато си готов)
  stats: AdminStats = {
    guests: 128,
    rooms: 64,
    cruises: 12,
    occupancyPct: 72
  };

  // 📋 Таблични данни (пример)
  projects: ProjectRow[] = [
    {
      id: 'p-101',
      name: 'Стая 305 – ремонт',
      iconUrl: 'assets/icons/room.svg',
      priority: 'medium',
      progressPct: 65,
      teamAvatars: [
        'assets/avatars/a1.png',
        'assets/avatars/a2.png',
        'assets/avatars/a3.png'
      ]
    },
    {
      id: 'p-102',
      name: 'Круиз – августовски пакет',
      iconUrl: 'assets/icons/cruise.svg',
      priority: 'low',
      progressPct: 85,
      teamAvatars: [
        'assets/avatars/a2.png',
        'assets/avatars/a4.png'
      ]
    },
    {
      id: 'p-103',
      name: 'Гост – VIP обслужване',
      iconUrl: 'assets/icons/guest.svg',
      priority: 'high',
      progressPct: 40,
      teamAvatars: [
        'assets/avatars/a1.png'
      ]
    }
  ];

  ngOnInit(): void {
    // TODO: вържи към бекенд:
    // this.statsService.getAdminStats().subscribe(s => this.stats = s);
    // this.statsService.getProjects().subscribe(p => this.projects = p);
  }

  onCreate(): void {
    // TODO: отвори модал/навигация за създаване (стая/круиз/кампания)
    console.log('Create action…');
  }

  // Хелпери за шаблона
  badgeClass(level: BadgeLevel): string {
    return `badge ${level}`;
  }

  progressStyle(percent: number): { width: string } {
    const clamped = Math.max(0, Math.min(100, percent));
    return { width: `${clamped}%` };
  }
}

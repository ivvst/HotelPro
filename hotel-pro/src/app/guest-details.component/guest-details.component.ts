import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';

import { GuestService } from '../services/guest.service';
import { CruiseService } from '../services/cruise.service';

import { Cruise } from '../types/cruise';
import { Guest } from '../types/guests';
import { Excursion } from '../types/excursion';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-details',
  templateUrl: './guest-details.component.html',
  styleUrl: './guest-details.component.css',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class GuestDetailsComponent implements OnInit {
  guest: Guest | null = null;
  cruise: Cruise | null = null;

  loading = false;
  infoMsg = '';

  vipEnabled = false;
  vipServices: string[] = [];

  selectedExcursionId = '';
  confirmOpen = false;
  confirmExId: string | null = null;
  confirmExName: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private guestService: GuestService,
    private cruiseService: CruiseService
  ) { }

  ngOnInit(): void {
    const guestId = this.route.snapshot.paramMap.get('id');
    if (!guestId) return;

    this.loading = true;
    this.guestService.getGuestById(guestId).subscribe({
      next: guest => {
        this.guest = guest;

        // VIP данни
        this.vipEnabled = guest.isVIP ?? false;
        this.vipServices = Array.isArray(guest.vipServices) ? guest.vipServices : [];

        if (guest.cruiseId) {
          this.cruiseService.getCruiseById(guest.cruiseId).subscribe({
            next: cruise => {
              this.cruise = cruise;
              this.loading = false;
            },
            error: () => {
              this.loading = false;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  /** Помощен: намери екскурзията по id в текущия круиз */
  getExcursionById(id?: string) {
    return this.cruise?.excursions?.find(e => e._id === id);
  }
  /** Проверка дали гостът вече е записан в екскурзията */
  isGuestAlreadyAddedToExcursion(guest: Guest, exId?: string): boolean {
    if (!exId || !guest?.excursions) return false;
    return guest.excursions.some(gex => String(gex._id) === String(exId));
  }

  /** Централизиран рефреш след промяна: презарежда госта и круиза и показва статус */
  private refreshAfterChange(changedExId: string) {
    if (!this.guest?._id || !this.guest?.cruiseId) return;
    this.loading = true;

    forkJoin({
      guest: this.guestService.getGuestById(this.guest._id),
      cruise: this.cruiseService.getCruiseById(this.guest.cruiseId)
    }).subscribe({
      next: ({ guest, cruise }) => {
        this.guest = guest;
        this.cruise = cruise;

        const stillHas = (guest.excursions || []).some(e => String(e._id) === String(changedExId));
        const ex = cruise.excursions?.find(e => String(e._id) === String(changedExId));
        const isInWait = Array.isArray(ex?.waitlist) && ex!.waitlist!.some(w => String(w.guestId) === String(guest._id));

        this.infoMsg = stillHas
          ? '✅ Гостът е записан за екскурзията.'
          : (isInWait ? '⏳ Екскурзията е пълна — гостът е в чакащи.' : 'ℹ️ Данните са обновени.');

        this.loading = false;
        setTimeout(() => (this.infoMsg = ''), 3000);
      },
      error: () => { this.loading = false; }
    });
  }

  /** Добавяне на екскурзия към госта (оставяме твоя поток) */
  addExcursionToGuest(): void {
    if (!this.guest || !this.selectedExcursionId) return;

    const ex = this.cruise?.excursions.find(e => e._id === this.selectedExcursionId);
    if (!ex || !ex._id || !this.guest._id) return;

    const already = (this.guest.excursions || []).some(gex => String(gex._id) === String(ex._id));
    if (already) {
      this.infoMsg = 'ℹ️ Гостът вече е записан в тази екскурзия.';
      setTimeout(() => (this.infoMsg = ''), 2500);
      return;
    }

    this.loading = true;
    this.guestService.addExcursionToGuest(this.guest._id, { _id: ex._id, name: ex.name })
      .subscribe({
        next: updatedGuest => {
          // локално обновяване както при теб
          this.guest = updatedGuest;
          const exId = ex._id;
          this.selectedExcursionId = '';

          // презареди госта + круиза и покажи статуса
          if (exId) {
            this.refreshAfterChange(exId);
          }
        },
        error: err => {
          console.error('addExcursion error:', err);
          this.loading = false;
        }
      });
  }

  /** Премахване на екскурзия от госта */
  removeExcursionFromGuest(excursionId: string): void {
    if (!this.guest || !this.guest._id) return;

    this.loading = true;
    this.guestService.removeExcursionFromGuest(this.guest._id, excursionId)
      .subscribe({
        next: updatedGuest => {
          this.guest = updatedGuest;
          this.infoMsg = '🗑 Екскурзията е премахната от госта.';
          // презареди круиза, за да се обновят чакащите/капацитетът
          if (this.guest?.cruiseId) {
            this.cruiseService.getCruiseById(this.guest.cruiseId).subscribe({
              next: cruise => {
                this.cruise = cruise;
                this.loading = false;
                setTimeout(() => (this.infoMsg = ''), 2500);
              },
              error: () => {
                this.loading = false;
              }
            });
          } else {
            this.loading = false;
            setTimeout(() => (this.infoMsg = ''), 2500);
          }
        },
        error: err => {
          console.error('removeExcursion error:', err);
          this.loading = false;
        }
      });
  }

  /** Модал: отваряне/затваряне/потвърждение */
  openConfirm(ex: { _id?: string; name: string }): void {
    if (!ex._id) return;
    this.confirmExId = ex._id;
    this.confirmExName = ex.name;
    this.confirmOpen = true;
  }

  closeConfirm(): void {
    this.confirmOpen = false;
    this.confirmExId = null;
    this.confirmExName = null;
  }

  confirmDelete(): void {
    if (!this.confirmExId) return;
    this.removeExcursionFromGuest(this.confirmExId);
    this.closeConfirm();
  }
}

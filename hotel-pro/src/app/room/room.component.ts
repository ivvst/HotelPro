import { Component, OnInit } from '@angular/core';
import { RoomService } from '../services/room.service';
import { GuestService } from '../services/guest.service';
import { CruiseService } from '../services/cruise.service';
import { Room } from '../types/room';
import { Guest } from '../types/guests';
import { Cruise } from '../types/cruise';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ShortenPipe } from '../pipes/shorten.pipes';

interface RoomsStats extends Room {
  guestCount: number;
  isVip: boolean;
}

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ShortenPipe],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit {
  cruises: Cruise[] = [];
  rooms: Room[] = [];
  guests: Guest[] = [];

  selectedCruiseId: string | null = null;
  expandedGuestId: string | null = null;
  selectedRoom: RoomsStats | null = null;

  get filteredGuests(): Guest[] {
    if (!this.selectedCruiseId) return [];
    return this.guests.filter(g => g.cruiseId === this.selectedCruiseId);
  }

  get roomsStats(): RoomsStats[] {
    console.log(this.rooms.map(room => {
      const guestsInRoom = this.filteredGuests.filter(g => g.roomNumber.toString() == room.number);
      return {
        ...room,
        guestCount: guestsInRoom.length,
        isVip: guestsInRoom.some(g => g.isVIP)
      };
    }));

    return this.rooms.map(room => {
      const guestsInRoom = this.filteredGuests.filter(g => g.roomNumber.toString() == room.number);
      return {
        ...room,
        guestCount: guestsInRoom.length,
        isVip: guestsInRoom.some(g => g.isVIP)
      };
    });
  }


  toggleGuestCard(guestId: string) {
    this.expandedGuestId = this.expandedGuestId === guestId ? null : guestId;
  }

  get rhineRooms(): RoomsStats[] {
    return this.roomsStats.filter(r => r.deck === 'rhine');
  }

  get mainRooms(): RoomsStats[] {
    return this.roomsStats.filter(r => r.deck === 'main');
  }

  constructor(
    private roomService: RoomService,
    private guestService: GuestService,
    private cruiseService: CruiseService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cruiseService.getAllCruises().subscribe(c => this.cruises = c);
    this.roomService.getAllRooms().subscribe(r => this.rooms = r);
    this.guestService.getAllGuests().subscribe(g => this.guests = g);
  }

  getCruiseNameById(id: string): string {
    return this.cruises.find(c => c._id === id)?.name || '';
  }

  // Отваряне на модал при клик на стая
  openRoomModal(room: RoomsStats) {
    this.selectedRoom = room;
  }

  // Затваряне на модал
  closeRoomModal() {
    this.selectedRoom = null;
  }

  // Пренасочване към guest-add
  addGuestToRoom(room: RoomsStats) {
    this.router.navigate(['/guest-add'], {
      queryParams: {
        room: room.number,
        cruise: this.selectedCruiseId
      }
    });
  }

  editGuest(_id: string) {
    this.router.navigate(['/guest-edit', _id]);
  }

  guestsInSelectedRoom() {
    if (!this.selectedRoom) return [];
    return this.filteredGuests.filter(
      g => g.roomNumber === Number(this.selectedRoom!.number)
    );
  }
  // Показване на гостите в стаята (може да е модал, alert или каквото поискаш)
  showGuestsForRoom(room: RoomsStats) {
    const guests = this.filteredGuests.filter(g => g.roomNumber === Number(room.number));
    if (guests.length) {
      alert(
        guests.map(g => `${g.firstName} ${g.lastName}`).join('\n')
      );
    } else {
      alert('Няма гости в тази стая.');
    }
  }

  trackById = (_: number, room: Room) => room._id;
}

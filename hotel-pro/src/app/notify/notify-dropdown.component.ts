// src/app/notify/notify-dropdown.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NotifyService } from '../services/notify.service';
import { Task } from '../types/task';                 // <— твоя Task с username/role
import { UserService } from '../services/user.service';
import { UserForAuth } from '../types/user';

@Component({
  selector: 'app-notify-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notify-dropdown.component.html',
  styleUrls: ['./notify-dropdown.component.css']
})
export class NotifyDropdownComponent implements OnInit {
  @Input() open = false;

  tasks: Task[] = [];
  users: UserForAuth[] = [];      // <— използваме твоя тип
  isAdmin = false;

  newTaskText = '';
  selectedUserId = '';

  constructor(
    private notify: NotifyService,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.isAdmin = this.userService.user?.role === 'admin';
    this.loadTasks();

    if (this.isAdmin) {
      this.userService.getAllUsers().subscribe(u => this.users = u);
    }
  }

  loadTasks() {
    this.notify.getAll().subscribe(tasks => {
      this.tasks = this.isAdmin
        ? tasks
        : tasks.filter(t => t.assignedTo === this.userService.user?._id);
    });
  }

  addTask() {
    if (!this.newTaskText.trim() || !this.selectedUserId) return;
    this.notify.create(this.newTaskText, this.selectedUserId).subscribe(() => {
      this.newTaskText = '';
      this.selectedUserId = '';
      this.loadTasks();
    });
  }

  markAsDone(task: Task) {
    const uid = this.userService.user?._id || '';
    this.notify.markDone(task._id, uid).subscribe(() => this.loadTasks());
  }
}

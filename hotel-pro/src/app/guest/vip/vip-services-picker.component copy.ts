import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VipServicesApi } from '../../services/vip.service';
import { VipService } from '../../types/vip';

@Component({
  selector: 'app-vip-services-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vip-services-picker.component.html',
  styleUrls: ['./vip-services-picker.component.css']
})
export class VipServicesPickerComponent implements OnInit {
  // двупосочни биндинги от формата на госта
  @Input() isVip = false;
  @Output() isVipChange = new EventEmitter<boolean>();

  @Input() services: string[] = [];
  @Output() servicesChange = new EventEmitter<string[]>();

  // само админ може да управлява каталога
  @Input() canManage = false;

  // каталог от бекенда (чипове за бърз избор)
  catalog: VipService[] = [];
  loading = false;
  error = '';

  // за добавяне в каталога (само админ)
  newCatalogItem = '';

  private api = inject(VipServicesApi);

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog() {
    this.loading = true;
    this.api.getAll().subscribe({
      next: (list) => { this.catalog = list; this.loading = false; },
      error: () => { this.error = 'Проблем при зареждане на VIP услугите.'; this.loading = false; }
    });
  }

  toggleVip(v: boolean) {
    this.isVip = v;
    this.isVipChange.emit(this.isVip);
    if (!v) {
      this.services = [];
      this.servicesChange.emit(this.services);
    }
  }

  toggleFromCatalog(item: VipService) {
    const has = this.services.includes(item.name);
    this.services = has
      ? this.services.filter(s => s !== item.name)
      : [...this.services, item.name];
    this.servicesChange.emit(this.services);
  }

  // само админ
  addToCatalog() {
    if (!this.canManage) return;
    const name = this.newCatalogItem.trim();
    if (!name) return;
    this.api.create(name).subscribe({
      next: (created) => {
        this.catalog = [...this.catalog, created].sort((a,b)=>a.name.localeCompare(b.name));
        this.newCatalogItem = '';
      },
      error: (e) => { this.error = e?.error?.message || 'Неуспешно добавяне.'; }
    });
  }

  // по желание: триене от каталога (само админ)
  removeFromCatalog(item: VipService) {
    if (!this.canManage) return;
    if (!confirm(`Изтриване на "${item.name}" от каталога?`)) return;
    this.api.delete(item._id).subscribe({
      next: () => { this.catalog = this.catalog.filter(c => c._id !== item._id); },
      error: (e) => { this.error = e?.error?.message || 'Неуспешно изтриване.'; }
    });
  }
}

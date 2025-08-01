import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CatalogComponent } from './catalog/catalog.component';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { RoomComponent } from './room/room.component';
import { CruisesComponent } from './cruise/cruise.component';
import { GuestComponent } from './guest/guest.component';
import { GuestAddComponent } from './guest/create-guest/guest-add.component';
import { GuestEditComponent } from './guest/edit-guest/guest-edit.component';
import { GuestDetailsComponent } from './guest-details.component/guest-details.component';
import { ExcursionListComponent } from './cruise/excursion/excursion-list.component';
// import { AuthGuard } from './app/guards/auth.guard';
// import { AdminGuard } from './app/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'cruise', component: CruisesComponent },
  {   path: 'cruise/:id', component: CruisesComponent },
  // excursion list for chosen cruise
  { path: 'cruises/:id/excursions', component: ExcursionListComponent },

  //Guest-actions
  { path: 'guest', component: GuestComponent },
  { path: 'guest-add', component: GuestAddComponent },
  { path: 'guest-edit/:id', component: GuestEditComponent },
 // Детайли за гост (и добавяне на екскурзии)
  { path: 'guests/:id', component: GuestDetailsComponent },


  { path: 'home', component: HomeComponent },
  { path: 'room', component: RoomComponent },

  { path: 'login', component: LoginComponent, },
  { path: 'register', component: RegisterComponent, },

  { path: 'dashboard', component: DashboardComponent },  //canActivate: [AuthGuard] },
  { path: 'catalog', component: CatalogComponent }, //canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent }, //canActivate: [AdminGuard] },
  // {
  //   // path: 'dashboard',
  //   // canActivate: [AuthGuard],
  //   // loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  // }

  // { path: '**', redirectTo: '' }
];

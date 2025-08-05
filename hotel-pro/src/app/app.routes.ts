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
import { ProfileComponent } from './profile.component';
import { CruiseAddComponent } from './cruise/create-cruise/cruise-add.component';
import { AdminGuard } from './guards/admin.guards';
import { AuthGuard } from './guards/auth.guards';
import { GuestGuard } from './guards/guest.guards';
// import { AuthGuard } from './app/guards/auth.guard';
// import { AdminGuard } from './app/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'cruise', component: CruisesComponent,canActivate: [AuthGuard] },
  { path: 'cruise/add', component: CruiseAddComponent, canActivate: [AdminGuard] }, // само за админ
  { path: 'profile', canActivate: [AuthGuard], loadComponent: () => import('./profile.component').then(m => m.ProfileComponent) },
  { path: 'cruise/:id', component: CruisesComponent ,canActivate: [AuthGuard]},
  // excursion list for chosen cruise
  { path: 'cruises/:id/excursions', component: ExcursionListComponent, canActivate: [AuthGuard] },

  //Guest-actions
  { path: 'guest', component: GuestComponent, canActivate: [AuthGuard] },
  { path: 'guest-add', component: GuestAddComponent, canActivate: [AuthGuard] },
  { path: 'guest-edit/:id', component: GuestEditComponent, canActivate: [AdminGuard] },
  // Детайли за гост (и добавяне на екскурзии)
  { path: 'guests/:id', component: GuestDetailsComponent, canActivate: [AuthGuard] },


  { path: 'home', component: HomeComponent },
  { path: 'room', component: RoomComponent, canActivate: [AuthGuard] },

  { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },


  { path: 'dashboard', component: DashboardComponent },  //canActivate: [AuthGuard] },
  { path: 'catalog', component: CatalogComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminPanelComponent, canActivate: [AdminGuard] }, //canActivate: [AdminGuard] },

  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  // {
  //   // path: 'dashboard',
  //   // canActivate: [AuthGuard],
  //   // loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  // }

  { path: '**', redirectTo: '/home' }
];

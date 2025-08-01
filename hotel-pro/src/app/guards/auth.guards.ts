
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

 canActivate(): Observable<boolean> {
  return this.userService.getProfile().pipe(
    map(() => true),
    catchError(() => {
      this.router.navigate(['/login']);
      return of(false);
    })
  );
}
}



// import { Injectable } from '@angular/core';
// import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
// import { Observable } from 'rxjs';
// // import { UserService } from '../services/user.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {

//   constructor(private userService: 
//     // UserService,
//      private router: Router) {}

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ):
//     | Observable<boolean | UrlTree>
//     | Promise<boolean | UrlTree>
//     | boolean
//     | UrlTree {
    
//     if (this.userService.isLoggedIn()) {
//       return true;
//     } else {
//       this.router.navigate(['/login']);
//       return false;
//     }
//   }
// }



import { Injectable } from '@angular/core';
import { 
    CanActivate
    ,Router
    ,ActivatedRouteSnapshot
    ,RouterStateSnapshot
    ,CanActivateChild
    ,Route
    ,CanLoad
} from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild, CanLoad{
    constructor(private authService: AuthService, private router: Router) { 
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let url: string = state.url;

        return this.checkLogin(url);
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        return this.canActivate(route, state);
    }

    canLoad(route: Route): boolean {
          let url = `/${route.path}`;

          return this.checkLogin(url);
    }

    checkLogin(url:string): boolean {
        if(this.authService.isLoggedin) {return true;}

        this.authService.redirectUrl = url;

        this.router.navigate(['/login']);
        return false;
    }

}
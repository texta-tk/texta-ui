import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../core/util/local-storage.service';
import { UserService } from '../core/users/user.service';
import { UserStore } from '../core/users/user.store';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfile } from '../shared/types/UserProfile';
import { LogService } from '../core/util/log.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-uaa-oauth',
  templateUrl: './uaa-oauth.component.html',
  styleUrls: ['./uaa-oauth.component.scss']
})
export class UaaOauthComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private userService: UserService,
    private logService: LogService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(switchMap(params => {
      // Get the tokens from queryParams
      const accessToken = params['access_token'];
      const refreshToken = params['refresh_token'];

      // Set them to the localstorage to be used in the interceptor
      if (refreshToken) {
        this.localStorageService.setOAuthRefreshToken(refreshToken);
      }

      if (accessToken) {
        this.localStorageService.setOAuthAccessToken(accessToken);
      }
      return this.userService.getUserProfile();
    })).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else if (resp) {
        this.router.navigate(['']);
      }
    });
  }

}

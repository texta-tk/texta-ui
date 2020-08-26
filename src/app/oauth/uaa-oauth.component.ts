import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../core/util/local-storage.service';
import { UserService } from '../core/users/user.service';
import { UserStore } from '../core/users/user.store';
import { HttpErrorResponse } from '@angular/common/http';
import { UserProfile } from '../shared/types/UserProfile';

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
    private userStore: UserStore,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      // Get the tokens from queryParams
      const accessToken = queryParams['access_token'];
      const refreshToken = queryParams['refresh_token'];

      // Set them to the localstorage to be used in the interceptor
      if (refreshToken) {
        this.localStorageService.setOAuthRefreshToken(refreshToken);
      }

      if (accessToken) {
        this.localStorageService.setOAuthAccessToken(accessToken);

        // Get the profile here too just in case to prevent racecon with UserStore
        this.userService.getUserProfile().subscribe((user: UserProfile | HttpErrorResponse) => {
          if (user && !(user instanceof HttpErrorResponse)) {
            this.userStore.setCurrentUser(user);
          }
        });
      }


      this.router.navigate(['']);
  });
  }

}

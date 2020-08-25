import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../core/util/local-storage.service';

@Component({
  selector: 'app-uaa-oauth',
  templateUrl: './uaa-oauth.component.html',
  styleUrls: ['./uaa-oauth.component.scss']
})
export class UaaOauthComponent implements OnInit {
  accessToken: any;
  refreshToken: any;

  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      // Get the tokens from queryParams
      this.accessToken = queryParams['access_token'];
      this.refreshToken = queryParams['refresh_token'];

      // Set them to the localstorage to be used in the interceptor
      this.localStorageService.setOAuthAccessToken(this.accessToken);
      this.localStorageService.setOAuthRefreshToken(this.refreshToken);

      console.log('here 2:)');
      this.router.navigate(['']);
  });
  }

}

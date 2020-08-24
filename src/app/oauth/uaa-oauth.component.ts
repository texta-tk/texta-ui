import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-uaa-oauth',
  templateUrl: './uaa-oauth.component.html',
  styleUrls: ['./uaa-oauth.component.scss']
})
export class UaaOauthComponent implements OnInit {
  accessToken: any;
  refreshToken: any;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(queryParams => {
      this.accessToken = queryParams['access_token'];
      this.refreshToken = queryParams['refresh_token'];
  });
  }

}

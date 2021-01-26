import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Health} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {UserStore} from '../core/users/user.store';
import {UserProfile} from '../shared/types/UserProfile';
import {of, Subject, Subscription} from 'rxjs';
import * as projectPackage from '../../../package.json';
import {CoreService} from '../core/core.service';
import {switchMap, takeUntil} from 'rxjs/operators';
import {PlotlyComponent} from "angular-plotly.js";
import {Plotly} from "angular-plotly.js/lib/plotly.interface";
import Layout = Plotly.Layout;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  health: Health;
  unreachable: boolean;
  user: UserProfile | null;
  frontVersion = projectPackage.version;
  destroyed$ = new Subject<boolean>();

  constructor(private coreService: CoreService, private userStore: UserStore) {

  }

  ngOnInit(): void {
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$), switchMap(user => {
      if (user) {
        this.user = user;
        return this.coreService.getHealth().pipe(takeUntil(this.destroyed$)); // when we route out, dont care about this request anymore
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.health = resp;
        this.unreachable = false;
      } else {
        this.unreachable = true;
      }
    });

  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

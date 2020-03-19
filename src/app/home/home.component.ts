import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProjectService} from '../core/projects/project.service';
import {Health} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {UserStore} from '../core/users/user.store';
import {UserProfile} from '../shared/types/UserProfile';
import {Subscription} from 'rxjs';
import * as projectPackage from '../../../package.json';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
    health: Health;
    unreachable: boolean;
    userSub: Subscription;
    user: UserProfile;
    frontVersion = projectPackage.version;

    constructor(private projectService: ProjectService, private userStore: UserStore) {

    }

    ngOnInit() {
        this.userSub = this.userStore.getCurrentUser().subscribe((user: UserProfile) => {
            this.user = user;
            this.projectService.getHealth().subscribe((resp: Health | HttpErrorResponse) => {
                if (resp && !(resp instanceof HttpErrorResponse)) {
                    this.health = resp;
                    this.unreachable = false;
                } else {
                    this.unreachable = true;
                }
            });
        });
    }

    ngOnDestroy(): void {
        this.userSub.unsubscribe();
    }

}

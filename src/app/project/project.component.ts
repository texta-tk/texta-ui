import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Project, ProjectResourceCounts} from '../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {from, Observable, Subject} from 'rxjs';
import {LogService} from '../core/util/log.service';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';
import {ProjectStore} from '../core/projects/project.store';
import {EditProjectDialogComponent} from './edit-project-dialog/edit-project-dialog.component';
import {UserProfile} from '../shared/types/UserProfile';
import {debounceTime, delay, filter, map, mergeMap, startWith, takeUntil, toArray} from 'rxjs/operators';
import {UserService} from '../core/users/user.service';
import {ConfirmDialogComponent} from '../shared/components/dialogs/confirm-dialog/confirm-dialog.component';
import {ProjectService} from '../core/projects/project.service';
import {UserStore} from '../core/users/user.store';
import {FormControl} from '@angular/forms';
import {MatOption} from '@angular/material/core';
import {KeyValue} from '@angular/common';
import {AppConfigService} from '../core/util/app-config.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectComponent implements OnInit, OnDestroy {
  PROJECT_ADMIN_SCOPE = AppConfigService.settings.uaaConf.admin_scope;
  UAA_ENABLED = AppConfigService.settings.useCloudFoundryUAA;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  filteredUsers: Observable<UserProfile[]>;
  // tslint:disable-next-line:no-any
  public projectCounts$: Observable<any>; // strict template and async pipe with keyvalue has buggy types for some reason
  public tableData: MatTableDataSource<Project> = new MatTableDataSource<Project>([]);
  public displayedColumns = ['id', 'title', 'author', 'indices_count', 'resource_count', 'users_count', 'Modify'];
  public isLoadingResults = true;
  public currentUser: UserProfile;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  public authorFilterControl = new FormControl();
  public titleFilterControl = new FormControl();
  private currentProject: Project;

  constructor(
    private projectStore: ProjectStore,
    private userService: UserService,
    private userStore: UserStore,
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public logService: LogService,
    private projectService: ProjectService) {
  }

  valueAscOrder = (a: KeyValue<string, number>, b: KeyValue<string, number>): number => {
    return b.value > a.value ? 1 : (a.value > b.value ? -1 : 0);
  }
  urlAccessor = (x: UserProfile) => x.url;

  ngOnInit(): void {
    this.tableData.sort = this.sort;
    this.tableData.paginator = this.paginator;
    this.tableData.filterPredicate = (data, element) => {
      if(element === '-1'){
	      return true;
      }
      return data.author.id === +element;
    };
    this.filteredUsers = this.userService.getAllUsers().pipe(filter(x=> !(x instanceof HttpErrorResponse))) as Observable<UserProfile[]>;

    this.titleFilterControl.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(200)).subscribe(x => {
      this.isLoadingResults = true;
      this.projectService.getProjects('title=' + x).subscribe(projects => {
        if (projects && !(projects instanceof HttpErrorResponse)) {
          this.tableData.data = projects;
          this.isLoadingResults = false;
        }
      });
    });

    // delay so we could navigate to the page smoothly, and then start rendering the table which takes resources
    this.projectStore.getProjects().pipe(delay(100), takeUntil(this.destroyed$)).subscribe(projects => {
      if (projects) {
        if (this.titleFilterControl.value) {
          this.titleFilterControl.setValue(this.titleFilterControl.value);
        } else {
          this.tableData.data = projects;
          this.isLoadingResults = false;
        }
      }
    });
    this.userStore.getCurrentUser().pipe(takeUntil(this.destroyed$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  edit(project: Project): void {
    this.dialog.open(EditProjectDialogComponent, {
      width: '750px',
      data: project
    }).afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp) {
        this.isLoadingResults = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateProjectDialogComponent, {
      maxHeight: '90vh',
      width: '700px',
    });
    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.isLoadingResults = true;
        this.changeDetectorRef.markForCheck();
        this.projectStore.refreshProjects(); // we also need to keep the navbar project select in sync not just table
        this.logService.snackBarMessage(`Created project ${resp.title}`, 2000);
        this.projectStore.setCurrentProject(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  trackById(index: number, item: Project): number {
    return item.id;
  }

  onDelete(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {confirmText: 'Delete', mainText: `Delete the project \"${project.id}: ${project.title}\"?`}
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroyed$)).subscribe(result => {
      if (result) {
        this.isLoadingResults = true;
        this.changeDetectorRef.markForCheck();
        this.projectService.deleteProject(project.id).subscribe(resp => {
          if (resp instanceof HttpErrorResponse) {
            this.logService.snackBarError(resp, 4000);
          } else {
            // deleted our currently active project
            if (project.id === this.currentProject?.id) {
              this.projectStore.setCurrentProject(null);
            }
            this.projectStore.refreshProjects(); // we also need to keep the navbar project select in sync not just table
            this.logService.snackBarMessage(`Deleted project ${project.title}`, 3000);
          }
        });
      }
    });
  }

  applyFilter(filterValue: { value: { id: number } }): void {
    this.tableData.filter = filterValue?.value ? filterValue.value.id.toString() : '';
  }

  selectProject(val: Project): void {
    if (val.users.find(x => x.url === this.currentUser.url) ||
      (AppConfigService.settings.useCloudFoundryUAA && val.scopes.find(x => this.currentUser.profile.scopes.includes(x)))) {
      this.projectStore.setCurrentProject(val);
    } else {
      this.isLoadingResults = true;
      this.projectService.addUsersToProject([this.currentUser.id], val.id).subscribe(resp => {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else if (resp) {
          this.projectStore.refreshProjects();
          this.projectStore.setCurrentProject(val);
        }
      });
    }
  }

  getResourceCounts(element: Project): void {
    this.projectCounts$ = this.projectService.getResourceCounts(element.id).pipe(
      filter(x => !(x instanceof HttpErrorResponse))) as Observable<ProjectResourceCounts>;
  }
}

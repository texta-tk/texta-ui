import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../shared/types/Project';
import {ProjectStore} from '../../core/projects/project.store';
import {ProjectService} from '../../core/projects/project.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../shared/types/UserProfile';
import {debounceTime, filter, mergeMap, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, from, Observable, of, Subject} from 'rxjs';
import {MatSelect} from '@angular/material/select';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {CoreService} from '../../core/core.service';
import {UserStore} from '../../core/users/user.store';

interface OnSubmitParams {
  indicesFormControl: { id: number; name: string }[];
  usersFormControl: UserProfile[];
  titleFormControl: string;
  administratorsFormControl: UserProfile[];
}

@Component({
  selector: 'app-edit-project-dialog',
  templateUrl: './edit-project-dialog.component.html',
  styleUrls: ['./edit-project-dialog.component.scss']
})
export class EditProjectDialogComponent implements OnInit, AfterViewInit {
  // @ts-ignore
  public filteredIndices: BehaviorSubject<{ id: number, name: string }[] | null> = new BehaviorSubject(null);
  indicesFilterFormControl = new FormControl();
  indices: { id: number, name: string }[] = [];
  users: UserProfile[] = [];
  selectedUsers: UserProfile[] = [];
  currentProject: Project;
  projectForm = new FormGroup({
    titleFormControl: new FormControl('', [
      Validators.required,
    ]),
    indicesFormControl: new FormControl([]),
    usersFormControl: new FormControl(this.selectedUsers),
    administratorsFormControl: new FormControl([]),
  });
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentUser: UserProfile;
  initialProjectState: Project;
  isLoading = false;
  hasIndexPermissions = false;
  @ViewChild('multiSelect', {static: false}) multiSelect: MatSelect;

  constructor(public dialogRef: MatDialogRef<EditProjectDialogComponent>,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: Project,
              private userService: UserService,
              private projectStore: ProjectStore,
              private userStore: UserStore,
              private coreService: CoreService,
              private projectService: ProjectService) {

  }

  idCompare = (o1: { id: number }, o2: { id: number }) => o1?.id === o2?.id;

  urlAccessor = (x: UserProfile) => x.url;

  initForm(): void {
    const indices = this.projectForm.get('indicesFormControl');
    if (indices) {
      indices.setValue(this.initialProjectState.indices);
    }

    const title = this.projectForm.get('titleFormControl');
    if (title && this.initialProjectState.title) {
      title.setValue(this.initialProjectState.title);
    }
    if (this.initialProjectState.users) {
      this.selectedUsers.push(...this.initialProjectState.users);
      const users = this.projectForm.get('usersFormControl');
      if (users) {
        users.setValue(this.selectedUsers);
      }
    }
    if (this.initialProjectState.administrators) {
      const users = this.projectForm.get('administratorsFormControl');
      if (users) {
        users.setValue(this.initialProjectState.administrators);
      }
    }
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$)).subscribe(proj => {
      if (proj) {
        this.currentProject = proj;
      }
    });
    this.initialProjectState = {...this.data};
    this.initForm();
    this.userStore.getCurrentUser().pipe(take(1), switchMap(resp => {
      if (resp) {
        this.currentUser = resp;
        if (resp?.is_superuser) {
          return forkJoin({indices: this.coreService.getIndices(), users: this.userService.getAllUsers()});
        } else if (this.initialProjectState.author_username === resp.username || this.initialProjectState.administrators.find(y => y.id === resp.id)) {
          this.hasIndexPermissions = true;
          this.users = UtilityFunctions.sortByStringProperty(this.initialProjectState.users, (x => x.username));
          this.indices = this.initialProjectState.indices.sort((a, b) => (a.name > b.name) ? 1 : -1);
          this.filteredIndices.next(this.indices.slice());
        } else {
          this.projectForm.get('indicesFormControl')?.disable();
        }
      }
      return of(null);
    })).subscribe(resp => {
      if (resp?.indices instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp.indices, 5000);
      } else if (resp?.indices) {
        this.indices = resp.indices.sort((a, b) => (a.name > b.name) ? 1 : -1);
        this.filteredIndices.next(this.indices.slice());
      }
      if (resp?.users instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp.users, 5000);
      } else if (resp?.users) {
        this.users = UtilityFunctions.sortByStringProperty(resp.users, (x => x.username));
      }
    });
    this.indicesFilterFormControl.valueChanges
      .pipe(takeUntil(this.destroyed$), debounceTime(300))
      .subscribe(() => {
        this.filterIndices();
      });
  }

  ngAfterViewInit(): void {
    this.filteredIndices
      .pipe(filter(x => !!x), take(1))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredIndices are loaded initially
        // and after the mat-option elements are available
        this.multiSelect.compareWith = this.idCompare;
      });
  }


  onSubmit(formData: OnSubmitParams): void {
    const observables: Observable<{ addObs: HttpErrorResponse | { message: string }, deleteObs: HttpErrorResponse | { message: string } } | HttpErrorResponse | Project>[] = [];
    if (!UtilityFunctions.arrayValuesEqual(this.initialProjectState.users, formData.usersFormControl, (x => x.url))) {
      observables.push(this.updateProjectUsers(this.initialProjectState.users, formData.usersFormControl, this.initialProjectState.id));
    }

    if (!UtilityFunctions.arrayValuesEqual(this.initialProjectState.administrators, formData.administratorsFormControl, (x => x.url))) {
      observables.push(this.updateProjectAdministrators(this.initialProjectState.administrators, formData.administratorsFormControl, this.initialProjectState.id));
    }

    if (formData.indicesFormControl && !UtilityFunctions.arrayValuesEqual(this.initialProjectState.indices, formData.indicesFormControl, (x => x.id))) {
      observables.push(this.updateProjectIndices(this.initialProjectState.indices, formData.indicesFormControl, this.initialProjectState.id));
    }

    if (this.initialProjectState.title !== formData.titleFormControl) {
      observables.push(this.projectService.editProject({title: formData.titleFormControl}, this.initialProjectState.id));
    }

    this.isLoading = observables.length > 0;
    forkJoin(observables).subscribe(resp => {
      this.isLoading = false;
      if (resp && resp.length > 0) {
        let errors = false;
        for (const obs of resp) {
          if (obs instanceof HttpErrorResponse) {
            this.logService.snackBarError(obs);
            errors = true;
          } else if (obs instanceof Project) {
          } else if (obs?.addObs instanceof HttpErrorResponse || obs?.deleteObs instanceof HttpErrorResponse) {
            errors = true;
            break;
          }
        }
        if (!errors) {
          this.projectStore.refreshProjects(this.currentProject.id === this.data.id);
          this.dialogRef.close(true);
        }
      }
    });

    /*    this.data.indices = formData.indicesFormControl;
        this.data.users = formData.usersFormControl;
        this.data.title = formData.titleFormControl;*/

  }

  // tslint:disable-next-line:max-line-length
  updateProjectUsers(oldUsers: UserProfile[], newUsers: UserProfile[], projectId: number): Observable<{ addObs: HttpErrorResponse | { message: string }, deleteObs: HttpErrorResponse | { message: string } }> {
    // tslint:disable-next-line:no-any
    const forkObject: { addObs: Observable<any>, deleteObs: Observable<any> } = {addObs: of(null), deleteObs: of(null)};

    const usersToDelete = oldUsers.filter(oldUser => !newUsers.find(x => x.url === oldUser.url));
    const usersToAdd = newUsers.filter(newUser => !oldUsers.find(x => x.url === newUser.url));

    if (usersToAdd.length > 0) {
      forkObject.addObs = this.projectService.addUsersToProject(usersToAdd.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        } else if (resp) {
          this.initialProjectState.users.push(...usersToAdd);
        }
      }));
    }
    if (usersToDelete.length > 0) {
      forkObject.deleteObs = this.projectService.deleteUsersFromProject(usersToDelete.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        } else if (resp) {
          this.initialProjectState.users = this.initialProjectState.users.filter(x => !usersToDelete.includes(x));
        }
      }));
    }
    return forkJoin(forkObject);
  }


  protected filterIndices(): void {
    if (!this.indices) {
      return;
    }
    // get the search keyword

    let search = this.indicesFilterFormControl.value;
    if (!search) {
      this.filteredIndices.next(this.indices.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredIndices.next(
      this.indices.filter(index => index.name.toLowerCase().indexOf(search) > -1)
    );
  }

  // tslint:disable-next-line:max-line-length
  private updateProjectAdministrators(oldUsers: UserProfile[], newUsers: UserProfile[], projectId: number): Observable<{ addObs: HttpErrorResponse | { message: string }, deleteObs: HttpErrorResponse | { message: string } }> {
    // tslint:disable-next-line:no-any
    const forkObject: { addObs: Observable<any>, deleteObs: Observable<any> } = {addObs: of(null), deleteObs: of(null)};

    const usersToDelete = oldUsers.filter(oldUser => !newUsers.find(x => x.url === oldUser.url));
    const usersToAdd = newUsers.filter(newUser => !oldUsers.find(x => x.url === newUser.url));

    if (usersToAdd.length > 0) {
      forkObject.addObs = this.projectService.addAdminsToProject(usersToAdd.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        } else if (resp) {
          this.initialProjectState.users.push(...usersToAdd);
        }
      }));
    }
    if (usersToDelete.length > 0) {
      forkObject.deleteObs = this.projectService.deleteAdminsFromProject(usersToDelete.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        } else if (resp) {
          this.initialProjectState.users = this.initialProjectState.users.filter(x => !usersToDelete.includes(x));
        }
      }));
    }
    return forkJoin(forkObject);
  }

  private updateProjectIndices(oldIndices: { id: number; name: string }[], newIndices: { id: number; name: string }[], projectId: number)
    : Observable<{ addObs: HttpErrorResponse | { message: string }, deleteObs: HttpErrorResponse | { message: string } }> {
    // tslint:disable-next-line:no-any
    const forkObject: { addObs: Observable<any>, deleteObs: Observable<any> } = {addObs: of(null), deleteObs: of(null)};

    const indicesToDelete = oldIndices.filter(oldIndex => !newIndices.find(x => x.id === oldIndex.id));
    const indicesToAdd = newIndices.filter(newIndex => !oldIndices.find(x => x.id === newIndex.id));

    if (indicesToAdd.length > 0) {
      forkObject.addObs = this.projectService.addIndicesToProject(indicesToAdd.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        }
      }));
    }
    if (indicesToDelete.length > 0) {
      forkObject.deleteObs = this.projectService.deleteIndicesFromProject(indicesToDelete.map(x => x.id), projectId).pipe(tap(resp => {
        if ((resp instanceof HttpErrorResponse)) {
          this.logService.snackBarError(resp);
        } else if (resp) {
          this.initialProjectState.indices = this.initialProjectState.indices.filter(x => !indicesToDelete.includes(x));
        }
      }));
    }
    return forkJoin(forkObject);
  }

}

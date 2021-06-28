import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../core/projects/project.service';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../shared/types/UserProfile';
import {Project} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {UserStore} from '../../core/users/user.store';
import {of, Subject} from 'rxjs';
import {switchMap, take, takeUntil} from 'rxjs/operators';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {CoreService} from '../../core/core.service';

interface OnSubmitParams {
  indicesFormControl: number[];
  usersFormControl: string[] | string;
  titleFormControl: string;
  administratorsFormControl: string[] | string;
}

@Component({
  selector: 'app-create-embedding-dialog',
  templateUrl: './create-project-dialog.component.html',
  styleUrls: ['./create-project-dialog.component.scss']
})
export class CreateProjectDialogComponent implements OnInit, OnDestroy {

  projectForm = new FormGroup({
    titleFormControl: new FormControl('', [
      Validators.required,
    ]),
    usersFormControl: new FormControl(),
    administratorsFormControl: new FormControl(),
    indicesFormControl: new FormControl(),
  });

  public filteredIndices: Subject<{ id: number, name: string }[]> = new Subject();
  indicesFilterFormControl = new FormControl();
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  users: UserProfile[];
  currentUser: UserProfile;
  indices: { id: number, name: string }[] = [];

  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private dialogRef: MatDialogRef<CreateProjectDialogComponent>,
              private projectService: ProjectService,
              private userService: UserService,
              private userStore: UserStore,
              private coreService: CoreService,
              private logService: LogService) {
  }

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.users = UtilityFunctions.sortByStringProperty(resp, (x => x.username));
      }
    });

    this.userStore.getCurrentUser().pipe(take(1), switchMap(resp => {
      if (resp) {
        this.currentUser = resp;
        if (resp.is_superuser) {
          return this.coreService.getIndices();
        } else {
          this.projectForm.get('indicesFormControl')?.disable();
        }
      }
      return of(null);
    })).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else if (resp) {
        this.indices = resp.sort((a, b) => (a.name > b.name) ? 1 : -1);
        this.filteredIndices.next(this.indices.slice());
      }
    });
    this.indicesFilterFormControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.filterIndices();
      });
  }

  onSubmit(formData: OnSubmitParams): void {
    let body;
    if (this.currentUser.is_superuser) {
      body = {
        indices_write: formData.indicesFormControl || [],
        users_write: formData.usersFormControl || [],
        title: formData.titleFormControl,
        administrators_write: formData.administratorsFormControl || []
      };
    } else {
      body = {
        indices_write: formData.indicesFormControl || [],
        users_write: this.newLineStringToList(formData.usersFormControl as string) || [],
        title: formData.titleFormControl,
        administrators_write: this.newLineStringToList(formData.administratorsFormControl as string) || []
      };
    }
    this.projectService.createProject(body).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  newLineStringToList(stringWithNewLines: string): string[] {
    const stringList = stringWithNewLines.split('\n');
    // filter out empty values
    return stringList.filter(x => x !== '');
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  filterIndices(): void {
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

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

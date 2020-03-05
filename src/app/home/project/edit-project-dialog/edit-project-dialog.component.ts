import {AfterViewInit, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Project} from '../../../shared/types/Project';
import {ProjectStore} from '../../../core/projects/project.store';
import {ProjectService} from '../../../core/projects/project.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';
import {UserService} from '../../../core/users/user.service';
import {UserProfile} from '../../../shared/types/UserProfile';
import {mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {from, of, ReplaySubject, Subject} from 'rxjs';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-edit-project-dialog',
  templateUrl: './edit-project-dialog.component.html',
  styleUrls: ['./edit-project-dialog.component.scss']
})
export class EditProjectDialogComponent implements OnInit, AfterViewInit {
  public filteredIndices: Subject<string[]> = new Subject<string[]>();
  indicesFilterFormControl = new FormControl();
  indices: string[] = [];
  users: UserProfile[] = [];
  selectedUsers: string[] = [];
  projectForm = new FormGroup({
    indicesFormControl: new FormControl([], Validators.required),
    usersFormControl: new FormControl(this.selectedUsers, Validators.required),
  });
  destroyed$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  constructor(public dialogRef: MatDialogRef<EditProjectDialogComponent>,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: Project,
              private userService: UserService,
              private projectStore: ProjectStore,
              private projectService: ProjectService) {
    const indices = this.projectForm.get('indicesFormControl');
    if (indices) {
      indices.setValue(this.data.indices);
    }

    if (this.data.users) {
      from(this.data.users).pipe(mergeMap(url => {
        return this.userService.getUserByUrl(url);
      })).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.selectedUsers.push(resp.url);
          const users = this.projectForm.get('usersFormControl')
          if (users) {
            users.setValue(this.selectedUsers);
          }
        }
      });
    }
  }

  ngOnInit() {
    this.projectService.getIndices().subscribe((resp: string[] | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        this.indices = resp;
        this.filteredIndices.next(this.indices.slice());
      }
    });
    this.userService.getAllUsers().subscribe((resp: UserProfile[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.users = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 4000);
      }
    });
    this.indicesFilterFormControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.filterIndices();
      });
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  protected setInitialValue() {
    this.filteredIndices
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        this.multiSelect.compareWith = (a: string, b: string) => a === b;
      });
  }

  protected filterIndices() {
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
    // filter the banks
    this.filteredIndices.next(
      this.indices.filter(index => index.toLowerCase().indexOf(search) > -1)
    );
  }

  onSubmit(formData) {
    this.data.indices = formData.indicesFormControl;
    this.data.users = formData.usersFormControl;
    this.projectService.editProject(this.data, this.data.id).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else if (resp) {
        this.projectStore.refreshProjects();
        this.dialogRef.close();
      }
    });
  }

}

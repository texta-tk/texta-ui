import {Component, OnDestroy, OnInit} from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {ProjectService} from '../../core/projects/project.service';
import {UserService} from '../../core/users/user.service';
import {UserProfile} from '../../shared/types/UserProfile';
import {Project} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {UserStore} from '../../core/users/user.store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {CoreService} from '../../core/core.service';

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
    usersFormControl: new FormControl([], [Validators.required]),
    indicesFormControl: new FormControl([]),
  });

  public filteredIndices: Subject<string[]> = new Subject<string[]>();
  indicesFilterFormControl = new FormControl();
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  users: UserProfile[];
  indices: string[] = [];

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
    this.coreService.getIndices().subscribe((resp: string[] | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else {
        this.indices = resp.sort();
        this.filteredIndices.next(this.indices.slice());
      }
    });

    this.indicesFilterFormControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.filterIndices();
      });
  }

  onSubmit(formData: { indicesFormControl: unknown; usersFormControl: unknown; titleFormControl: unknown; }): void {
    const body = {
      indices: formData.indicesFormControl,
      users: formData.usersFormControl,
      title: formData.titleFormControl
    };
    this.projectService.createProject(body).subscribe((resp: Project | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
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
    // filter the banks
    this.filteredIndices.next(
      this.indices.filter(index => index.toLowerCase().indexOf(search) > -1)
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

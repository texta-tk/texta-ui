import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaggerGroup} from '../../../../shared/types/tasks/Tagger';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {Project} from '../../../../shared/types/Project';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {TaggerGroupService} from '../../../../core/models/taggers/tagger-group.service';

@Component({
  selector: 'app-edit-tagger-group-dialog',
  templateUrl: './edit-tagger-group-dialog.component.html',
  styleUrls: ['./edit-tagger-group-dialog.component.scss']
})
export class EditTaggerGroupDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditTaggerGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TaggerGroup,
              private taggerGroupService: TaggerGroupService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  ngOnInit() {
  }

  onSubmit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.taggerGroupService.editTaggerGroup({description: this.data.description}, project.id, this.data.id);
      }
      return of(null);
    })).subscribe((resp: TaggerGroup | HttpErrorResponse) => {
      this.dialogRef.close(resp);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

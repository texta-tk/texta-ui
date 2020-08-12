import {Component, Inject} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaggerGroup} from '../../../shared/types/tasks/Tagger';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {TaggerGroupService} from '../../../core/models/taggers/tagger-group.service';

@Component({
  selector: 'app-edit-tagger-group-dialog',
  templateUrl: './edit-tagger-group-dialog.component.html',
  styleUrls: ['./edit-tagger-group-dialog.component.scss']
})
export class EditTaggerGroupDialogComponent {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditTaggerGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TaggerGroup,
              private taggerGroupService: TaggerGroupService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.taggerGroupService.editTaggerGroup({description: this.data.description}, project.id, this.data.id);
      }
      return of(null);
    })).subscribe(resp => {
      this.dialogRef.close(resp);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

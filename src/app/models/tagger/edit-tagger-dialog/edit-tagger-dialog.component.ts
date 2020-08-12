import {Component, Inject} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {Tagger} from '../../../shared/types/tasks/Tagger';

@Component({
  selector: 'app-edit-tagger-dialog',
  templateUrl: './edit-tagger-dialog.component.html',
  styleUrls: ['./edit-tagger-dialog.component.scss']
})
export class EditTaggerDialogComponent {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditTaggerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Tagger,
              private taggerService: TaggerService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.taggerService.editTagger({description: this.data.description}, project.id, this.data.id);
      }
      return of(null);
    })).subscribe(resp => {
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

}

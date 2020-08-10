import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {TaggerGroup} from '../../../shared/types/tasks/Tagger';
import {TaggerGroupService} from '../../../core/models/taggers/tagger-group.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {Project} from '../../../shared/types/Project';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {TorchTagger} from '../../../shared/types/tasks/TorchTagger';

@Component({
  selector: 'app-edit-torch-tagger-dialog',
  templateUrl: './edit-torch-tagger-dialog.component.html',
  styleUrls: ['./edit-torch-tagger-dialog.component.scss']
})
export class EditTorchTaggerDialogComponent {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditTorchTaggerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: TorchTagger,
              private torchTaggerService: TorchTaggerService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.torchTaggerService.editTorchTagger({description: this.data.description}, project.id, this.data.id);
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

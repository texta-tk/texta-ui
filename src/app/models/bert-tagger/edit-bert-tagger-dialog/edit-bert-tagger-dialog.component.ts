import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';
import {BertTaggerService} from '../../../core/models/bert-tagger/bert-tagger.service';

@Component({
  selector: 'app-edit-bert-tagger-dialog',
  templateUrl: './edit-bert-tagger-dialog.component.html',
  styleUrls: ['./edit-bert-tagger-dialog.component.scss']
})
export class EditBertTaggerDialogComponent{

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditBertTaggerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: BertTagger,
              private bertTaggerService: BertTaggerService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.bertTaggerService.editTagger({description: this.data.description}, project.id, this.data.id);
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

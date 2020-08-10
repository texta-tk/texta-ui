import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {of} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {Embedding} from '../../../../shared/types/tasks/Embedding';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-edit-embedding-dialog',
  templateUrl: './edit-embedding-dialog.component.html',
  styleUrls: ['./edit-embedding-dialog.component.scss']
})
export class EditEmbeddingDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditEmbeddingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: Embedding,
              private embeddingsService: EmbeddingsService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.embeddingsService.editEmbedding({description: this.data.description}, project.id, this.data.id);
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

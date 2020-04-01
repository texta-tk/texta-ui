import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectField} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
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

  ngOnInit() {
  }

  onSubmit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.embeddingsService.editEmbedding({description: this.data.description}, project.id, this.data.id);
      }
      return of(null);
    })).subscribe((resp: Embedding | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        console.log(resp);
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

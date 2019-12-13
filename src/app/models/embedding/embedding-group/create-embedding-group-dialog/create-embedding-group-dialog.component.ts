import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {ErrorStateMatcher, MatDialogRef} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {Embedding} from '../../../../shared/types/tasks/Embedding';
import {mergeMap, take} from 'rxjs/operators';
import {EmbeddingsService} from '../../../../core/embeddings/embeddings.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {LogService} from '../../../../core/util/log.service';
import {EmbeddingsGroupService} from '../../../../core/embeddings/embeddings-group.service';
import {EmbeddingCluster} from '../../../../shared/types/tasks/Embedding';

@Component({
  selector: 'app-create-embedding-group-dialog',
  templateUrl: './create-embedding-group-dialog.component.html',
  styleUrls: ['./create-embedding-group-dialog.component.scss']
})
export class CreateEmbeddingGroupDialogComponent implements OnInit {

  embeddingForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    embeddingFormControl: new FormControl('', [Validators.required]),
    clustersFormControl: new FormControl(500, [Validators.required]),

  });
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  embeddings: Embedding[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateEmbeddingGroupDialogComponent>,
    private projectStore: ProjectStore,
    private logService: LogService,
    private embeddingService: EmbeddingsService,
    private embeddingGroupService: EmbeddingsGroupService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.embeddingService.getEmbeddings(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      } else if (resp) {
        this.embeddings = resp;
      }
    });
  }

  onSubmit(formData) {
    const body = {
      description: formData.descriptionFormControl,
      embedding: formData.embeddingFormControl.id,
      num_clusters: formData.clustersFormControl,
    };
    console.log(body);
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.embeddingGroupService.createEmbeddingGroup(body, currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: EmbeddingCluster | HttpErrorResponse) => {
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

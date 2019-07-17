import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {ErrorStateMatcher} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {of} from 'rxjs';
import {Embedding} from '../../shared/types/Embedding';
import {mergeMap, take} from 'rxjs/operators';
import {ProjectService} from '../../core/projects/project.service';
import {EmbeddingsService} from '../../core/embeddings/embeddings.service';
import {ProjectStore} from '../../core/projects/project.store';
import {LogService} from '../../core/util/log.service';

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
  constructor(private projectService: ProjectService,
              private projectStore: ProjectStore,
              private logService: LogService,
              private embeddingService: EmbeddingsService) {
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
  ifError(){
    console.log(this.embeddingForm.get('embeddingFormControl'));
    return this.embeddingForm.get('embeddingFormControl').touched && this.embeddingForm.get('embeddingFormControl').hasError('required');
  }
}

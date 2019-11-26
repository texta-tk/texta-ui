import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher, MatDialogRef } from '@angular/material';
import { LiveErrorStateMatcher } from 'src/app/shared/CustomerErrorStateMatchers';
import { Embedding } from 'src/app/shared/types/tasks/Embedding';
import { ProjectField, ProjectFact } from 'src/app/shared/types/Project';
import { TorchTaggerService } from '../torch-tagger.service';
import { ProjectService } from 'src/app/core/projects/project.service';
import { ProjectStore } from 'src/app/core/projects/project.store';
import { take, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TorchTagger } from 'src/app/shared/types/tasks/TorchTagger';
import { EmbeddingsService } from 'src/app/core/embeddings/embeddings.service';

@Component({
  selector: 'app-create-torch-tagger-dialog',
  templateUrl: './create-torch-tagger-dialog.component.html',
  styleUrls: ['./create-torch-tagger-dialog.component.scss']
})
export class CreateTorchTaggerDialogComponent implements OnInit {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  torchTaggerForm = new FormGroup({
    descriptionFormControl: new FormControl('', [Validators.required]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    embeddingFormControl: new FormControl('', [Validators.required]),
    sampleSizeFormControl: new FormControl(10000, [Validators.required]),
    minSampleSizeFormControl: new FormControl(50, [Validators.required]),
    factNameFormControl: new FormControl(),
    modelArchitectureFormControl: new FormControl('', [Validators.required]),
    numEpochsFormControl: new FormControl(5, [Validators.required]),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  torchTaggerOptions: any;
  embeddings: Embedding[] = [];
  projectFields: ProjectField[];
  projectFacts: ProjectFact[];

  constructor(private dialogRef: MatDialogRef<CreateTorchTaggerDialogComponent>,
              private torchTaggerService: TorchTaggerService,
              private projectService: ProjectService,
              private embeddingService: EmbeddingsService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return forkJoin(
          {
            torchTaggerOptions: this.torchTaggerService.getTorchTaggerOptions(currentProject.id),
            projectFields: this.projectService.getProjectFields(currentProject.id),
            projectFacts: this.projectService.getProjectFacts(currentProject.id),
            projectEmbeddings: this.embeddingService.getEmbeddings(currentProject.id)

          });
      } else {
        return of(null);
      }
    })).subscribe((resp: {
      torchTaggerOptions: any | HttpErrorResponse,
      projectFields: ProjectField[] | HttpErrorResponse,
      projectFacts: ProjectFact[] | HttpErrorResponse,
      projectEmbeddings: {count: number; results: Embedding[]}| HttpErrorResponse
    }) => {
      if (resp) {
        if (!(resp.projectFields instanceof HttpErrorResponse)) {
          this.projectFields = resp.projectFields;
        }
        if (!(resp.projectFacts instanceof HttpErrorResponse)) {
          this.projectFacts = resp.projectFacts;
        }
        if (!(resp.projectEmbeddings instanceof HttpErrorResponse)) {
          this.embeddings = resp.projectEmbeddings.results;
        }
        if (!(resp.torchTaggerOptions instanceof HttpErrorResponse)) {
          this.torchTaggerOptions = resp.torchTaggerOptions;
        }
      }
    });
  }

  onQueryChanged(query: string) {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData) {
    const body = {
      description: formData.descriptionFormControl,
      fields: formData.fieldsFormControl,
      embedding: formData.embeddingFormControl,
      maximum_sample_size: formData.sampleSizeFormControl,
      minimum_sample_size: formData.minSampleSizeFormControl,
      num_epochs: formData.numEpochsFormControl,
      model_architecture: formData.modelArchitectureFormControl,
    };
    
    if (this.query) {
      body['query'] = this.query;
    }

    if (formData.factNameFormControl) {
      body['fact_name'] = formData.factNameFormControl;
    }


    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(currentProject => {
      if (currentProject) {
        return this.torchTaggerService.createTorchTagger(currentProject.id, body);
      } else {
        return of(null);
      }
    })).subscribe((resp: TorchTagger | HttpErrorResponse) => {
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
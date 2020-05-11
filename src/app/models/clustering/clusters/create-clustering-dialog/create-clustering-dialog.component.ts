import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../../shared/types/Project';
import {merge, of, Subject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../../core/util/log.service';
import {ProjectService} from '../../../../core/projects/project.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {Cluster} from '../../../../shared/types/tasks/Cluster';
import {ClusterService} from '../../../../core/models/clusters/cluster.service';
import {ClusterOptions} from '../../../../shared/types/tasks/ClusterOptions';
import {EmbeddingsService} from '../../../../core/models/embeddings/embeddings.service';
import {ResultsWrapper} from '../../../../shared/types/Generic';
import {Embedding} from '../../../../shared/types/tasks/Embedding';

@Component({
  selector: 'app-create-cluster-dialog',
  templateUrl: './create-clustering-dialog.component.html',
  styleUrls: ['./create-clustering-dialog.component.scss']
})
export class CreateClusteringDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  clusterForm = new FormGroup({
    descriptionFormControl: new FormControl('', [
      Validators.required,
    ]),
    keywordFilterFormControl: new FormControl(''),
    indicesFormControl: new FormControl([], [Validators.required]),
    numClusterFormControl: new FormControl(10),
    clusteringAlgorithmFormControl: new FormControl(),
    vectorizerFormControl: new FormControl(),
    embeddingFormControl: new FormControl(),
    numDimsFormControl: new FormControl(1000),
    useLSIFormControl: new FormControl(false),
    numTopicsFormControl: new FormControl(50),
    stopWordsFormControl: new FormControl([]),
    fieldsFormControl: new FormControl([], [Validators.required]),
    documentLimitFormControl: new FormControl(100),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  clusterOptions: ClusterOptions;
  projectFields: ProjectIndex[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  fieldsUnique: Field[] = [];
  projectIndices: ProjectIndex[] = [];
  embeddings: Embedding[];

  constructor(private dialogRef: MatDialogRef<CreateClusteringDialogComponent>,
              private clusterService: ClusterService,
              private logService: LogService,
              private embeddingsService: EmbeddingsService,
              private projectService: ProjectService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.clusterForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.getFieldsForIndices(currentProjIndices);
      }
    });

    this.projectStore.getProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(projIndices => {
      if (projIndices) {
        this.projectIndices = projIndices;
      }
    });

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return merge(this.clusterService.getClusterOptions(currentProject.id),
          this.embeddingsService.getEmbeddings(currentProject.id));
      } else {
        return of(null);
      }
    })).subscribe((resp: ClusterOptions | ResultsWrapper<Embedding> | HttpErrorResponse | null) => {
      if (resp) {
        if (this.isClusterOptions(resp)) {
          this.clusterOptions = resp as ClusterOptions;
          this.setDefaultFormValues(this.clusterOptions);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else if (resp.results && Embedding.isEmbedding(resp.results)) {
          this.embeddings = resp.results;
        }
      }
    });
  }

  getFieldsForIndices(indices: ProjectIndex[]) {
    this.projectFields = ProjectIndex.cleanProjectIndicesFields(indices, ['text'], []);
    this.fieldsUnique = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(y => y.fields).flat(), (y => y.path));
  }

  public indicesOpenedChange(opened) {
    const indicesForm = this.clusterForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (indicesForm?.value && indicesForm.value.length > 0)) {
      this.getFieldsForIndices(indicesForm?.value);
    }
  }

  isClusterOptions(options): options is ClusterOptions {
    return (options as ClusterOptions).actions !== undefined;
  }

  onQueryChanged(query: string) {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData) {
    const body: any = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map(x => [{name: x.index}]).flat(),
      num_cluster: formData.numClusterFormControl,
      vectorizer: formData.vectorizerFormControl.value,
      clustering_algorithm: formData.clusteringAlgorithmFormControl.value,
      num_dims: formData.numDimsFormControl,
      use_lsi: formData.useLSIFormControl,
      num_topics: formData.numTopicsFormControl,
      stop_words: formData.stopWordsFormControl.length > 0 ? formData.stopWordsFormControl.split('\n') : [],
      fields: formData.fieldsFormControl,
      embedding: (formData.embeddingFormControl as Embedding) ? (formData.embeddingFormControl as Embedding).id : null,
      document_limit: formData.documentLimitFormControl,
    };

    if (this.query) {
      body.query = this.query;
    }
    if (formData.keywordFilterFormControl) {
      body.significant_words_filter = formData.keywordFilterFormControl;
    }

    this.clusterService.createCluster(body, this.currentProject.id).subscribe((resp: Cluster | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.dialogRef.close(resp);
      }
    });
  }

  setDefaultFormValues(options: ClusterOptions) {
    const vectorizer = this.clusterForm.get('clusteringAlgorithmFormControl');
    if (vectorizer) {
      vectorizer.setValue(options.actions.POST.clustering_algorithm.choices[0]);
    }
    const classifier = this.clusterForm.get('vectorizerFormControl');
    if (classifier) {
      classifier.setValue(options.actions.POST.vectorizer.choices[0]);
    }
  }


  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

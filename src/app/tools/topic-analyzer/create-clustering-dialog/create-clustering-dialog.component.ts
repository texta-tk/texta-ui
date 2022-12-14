import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {merge, of, Subject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../../core/util/log.service';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {Cluster} from '../../../shared/types/tasks/Cluster';
import {TopicAnalyzerService} from '../../../core/tools/topic-analyzer/topic-analyzer.service';
import {ClusterOptions} from '../../../shared/types/tasks/ClusterOptions';
import {EmbeddingsService} from '../../../core/models/embeddings/embeddings.service';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {Embedding} from '../../../shared/types/tasks/Embedding';

@Component({
  selector: 'app-create-cluster-dialog',
  templateUrl: './create-clustering-dialog.component.html',
  styleUrls: ['./create-clustering-dialog.component.scss']
})
export class CreateClusteringDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  clusterForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [
      Validators.required,
    ]),
    keywordFilterFormControl: new UntypedFormControl(''),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    numClusterFormControl: new UntypedFormControl(10),
    clusteringAlgorithmFormControl: new UntypedFormControl(),
    vectorizerFormControl: new UntypedFormControl(),
    embeddingFormControl: new UntypedFormControl(),
    numDimsFormControl: new UntypedFormControl(1000),
    useLSIFormControl: new UntypedFormControl(false),
    numTopicsFormControl: new UntypedFormControl(50),
    stopWordsFormControl: new UntypedFormControl(''),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    documentLimitFormControl: new UntypedFormControl(100),
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  clusterOptions: ClusterOptions | undefined;
  projectFields: ProjectIndex[];
  currentProject: Project;
  destroyed$ = new Subject<boolean>();
  projectIndices: ProjectIndex[] = [];
  embeddings: Embedding[];
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateClusteringDialogComponent>,
              private clusterService: TopicAnalyzerService,
              private logService: LogService,
              private embeddingsService: EmbeddingsService,
              private projectService: ProjectService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.clusterForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.filterFields(currentProjIndices, ['text'], []);
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

  public indicesOpenedChange(opened: unknown): void {
    const indicesForm = this.clusterForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.filterFields(indicesForm.value, ['text'], []);
    }
  }

  isClusterOptions(options: unknown): options is ClusterOptions {
    return (options as ClusterOptions).actions !== undefined;
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  // tslint:disable-next-line:no-any
  onSubmit(formData: any): void {
    this.createRequestInProgress = true;
    const body = {
      description: formData.descriptionFormControl,
      indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
      num_cluster: formData.numClusterFormControl,
      vectorizer: formData.vectorizerFormControl.value,
      clustering_algorithm: formData.clusteringAlgorithmFormControl.value,
      num_dims: formData.numDimsFormControl,
      use_lsi: formData.useLSIFormControl,
      num_topics: formData.numTopicsFormControl,
      stop_words: formData.stopWordsFormControl.split('\n').filter((x: string) => !!x),
      fields: formData.fieldsFormControl,
      embedding: (formData.embeddingFormControl as Embedding) ? (formData.embeddingFormControl as Embedding).id : null,
      document_limit: formData.documentLimitFormControl,
      ...this.query ? {query: this.query} : {},
      ...formData.keywordFilterFormControl ? {significant_words_filter: formData.keywordFilterFormControl} : {},
    };

    this.clusterService.createCluster(body, this.currentProject.id).subscribe((resp: Cluster | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      }
      this.createRequestInProgress = false;
    });
  }

  setDefaultFormValues(options: ClusterOptions): void {
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

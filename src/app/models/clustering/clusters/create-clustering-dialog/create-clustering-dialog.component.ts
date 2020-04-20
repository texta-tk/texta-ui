import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../../shared/types/Project';
import {of, Subject} from 'rxjs';
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
    indicesFormControl: new FormControl([], [Validators.required]),
    numClusterFormControl: new FormControl(10),
    clusteringAlgorithmFormControl: new FormControl(),
    vectorizerFormControl: new FormControl(),
    numDimsFormControl: new FormControl(1000),
    useLSIFormControl: new FormControl(false),
    numTopicsFormControl: new FormControl(50),
    origTextFormControl: new FormControl(),
    stopWordsFormControl: new FormControl([]),
    ignoredIdsFormControl: new FormControl([]),
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

  constructor(private dialogRef: MatDialogRef<CreateClusteringDialogComponent>,
              private clusterService: ClusterService,
              private logService: LogService,
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
        return this.clusterService.getClusterOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: ClusterOptions | HttpErrorResponse | null) => {
      if (resp) {
        if (this.isClusterOptions(resp)) {
          this.clusterOptions = resp as ClusterOptions;
          this.setDefaultFormValues(this.clusterOptions);
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
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
      stop_words: formData.stopWordsFormControl,
      ignored_ids: formData.ignoredIdsFormControl,
      fields: formData.fieldsFormControl,
      document_limit: formData.documentLimitFormControl,
    };

    if (this.query) {
      body.query = this.query;
    }

    if (formData.origTextFormControl) {
      body.original_text_field = formData.origTextFormControl;
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

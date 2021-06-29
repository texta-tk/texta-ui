import {AfterViewInit, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ClusterService} from '../../../../../core/tools/clusters/cluster.service';
import {LogService} from '../../../../../core/util/log.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {AbstractControl, FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../../shared/CustomerErrorStateMatchers';
import {HttpErrorResponse} from '@angular/common/http';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';
import {FactTextInputGroup} from '../../../../../searcher/searcher-sidebar/build-search/Constraints';
import {debounceTime, pairwise, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {ProjectService} from '../../../../../core/projects/project.service';
import {ProjectStore} from '../../../../../core/projects/project.store';
import {Project, ProjectFact} from '../../../../../shared/types/Project';
import {ActivatedRoute} from '@angular/router';
import {Index} from '../../../../../shared/types/Index';

@Component({
  selector: 'app-tag-cluster-dialog',
  templateUrl: './tag-cluster-dialog.component.html',
  styleUrls: ['./tag-cluster-dialog.component.scss']
})
export class TagClusterDialogComponent implements OnInit, OnDestroy {
  tagForm = new FormGroup({
    nameFormControl: new FormControl('', [Validators.required]),
    strValFormControl: new FormControl({value: '', disabled: true}, [Validators.required]),
    docPathFormControl: new FormControl('', [Validators.required]),
  });
  isLoading = false;
  factValOptions: string[] = [];
  docPaths: string[];
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  currentProject: Project;
  indices: Index[] = [];
  projectFacts: string[] = [];

  constructor(private clusterService: ClusterService, private logService: LogService,
              private dialogRef: MatDialogRef<TagClusterDialogComponent>,
              private projectStore: ProjectStore,
              private projectService: ProjectService,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              @Inject(MAT_DIALOG_DATA) public data: { clusterId: number, clusteringId: number, projectId: number; columns: string[] }) {

  }

  ngOnInit(): void {
    if (this.data.columns) {
      this.docPaths = this.data.columns;
    }

    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return this.clusterService.getCluster(this.currentProject.id, (+this.data.clusteringId) || 0);
      } else {
        return of(null);
      }
    })).pipe(switchMap(cluster => {
      if (this.currentProject?.id && !(cluster instanceof HttpErrorResponse) && cluster) {
        this.indices = cluster.indices;
        this.projectFacts = ['Loading...'];
        return this.projectService.getProjectFacts(this.currentProject.id, cluster.indices.map(x => [{name: x.name}]).flat());
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projectFacts = resp;
      } else if (resp) {
        this.logService.snackBarError(resp, 4000);
      }
    });

    this.tagForm.get('nameFormControl')?.valueChanges.pipe(
      takeUntil(this.destroyed$),
      startWith(this.tagForm.get('nameFormControl')?.value as string),
      pairwise()).subscribe(([prev, next]: [string, string]) => {
      if (next) {
        this.tagForm.get('strValFormControl')?.enable();
        if (next !== prev) {
          this.tagForm.get('strValFormControl')?.setValue('');
        }
      } else {
        this.tagForm.get('strValFormControl')?.disable();
      }
    });

    this.tagForm.get('strValFormControl')?.valueChanges.pipe(
      takeUntil(this.destroyed$),
      debounceTime(100),
      switchMap(value => {
        // todo fix in TS 3.7
        // tslint:disable-next-line:no-non-null-assertion
        if ((value || value === '' && this.tagForm.get('nameFormControl')?.value) && this.currentProject) {
          this.factValOptions = ['Loading...'];
          this.isLoading = true;
          return this.projectService.projectFactValueAutoComplete(this.currentProject.id,
            // todo fix in TS 3.7
            // tslint:disable-next-line:no-non-null-assertion
            this.tagForm.get('nameFormControl')?.value, 10, value, this.indices.map(x => x.name));
        }
        return of(null);
      })).subscribe(val => {
      if (val && !(val instanceof HttpErrorResponse)) {
        this.isLoading = false;
        this.factValOptions = val;
      }
    });
  }


  onSubmit(formData: { nameFormControl: string; strValFormControl: string; docPathFormControl: string; }): void {
    const body = {
      fact: formData.nameFormControl,
      str_val: formData.strValFormControl,
      doc_path: formData.docPathFormControl
    };
    this.clusterService.tagCluster(this.data.projectId, this.data.clusteringId, this.data.clusterId, body).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage('Fact added.', 2000);
        this.dialogRef.close();
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 4000);
      }
    });
  }

  ngOnDestroy(): void {

    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

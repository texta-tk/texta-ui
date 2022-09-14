import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Field, Project, ProjectIndex} from '../../../shared/types/Project';
import {forkJoin, from, of, Subject} from 'rxjs';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {RegexTaggerGroupService} from '../../../core/models/taggers/regex-tagger-group/regex-tagger-group.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {filter, mergeMap, switchMap, take, takeUntil} from 'rxjs/operators';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {RegexTaggerGroup} from '../../../shared/types/tasks/RegexTaggerGroup';

@Component({
  selector: 'app-apply-tagger-group-dialog',
  templateUrl: './apply-tagger-group-dialog.component.html',
  styleUrls: ['./apply-tagger-group-dialog.component.scss']
})
export class ApplyTaggerGroupDialogComponent implements OnInit, OnDestroy {
  defaultQuery = '{"query": {"match_all": {}}}';
  query = this.defaultQuery;

  regexTaggerGroupForm = new UntypedFormGroup({
    descriptionFormControl: new UntypedFormControl('', [Validators.required]),
    indicesFormControl: new UntypedFormControl([], [Validators.required]),
    fieldsFormControl: new UntypedFormControl([], [Validators.required]),
    regexTaggersFormControl: new UntypedFormControl([], [Validators.required])
  });

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  currentProject: Project;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  projectRegexTaggers: RegexTaggerGroup[] = [];
  indices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  // tslint:disable-next-line:no-any
  regexTaggerOptions: any;

  constructor(private dialogRef: MatDialogRef<ApplyTaggerGroupDialogComponent>,
              private projectService: ProjectService,
              private regexTaggerGroupService: RegexTaggerGroupService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(proj => {
      if (proj) {
        this.currentProject = proj;
        return forkJoin({
          taggers: this.regexTaggerGroupService.getRegexTaggerGroupTasks(proj.id, '&page_size=9999'),
          indices: this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)),
          options: this.regexTaggerGroupService.applyRegexTaggerGroupOptions(proj.id),
        });
      }
      return of(null);
    })).subscribe(x => {
      if (x?.taggers && !(x.taggers instanceof HttpErrorResponse)) {
        this.projectRegexTaggers = x.taggers.results;
      } else if (x?.taggers && x.taggers instanceof HttpErrorResponse) {
        this.logService.snackBarError(x.taggers);
      }

      if (x?.indices && !(x.indices instanceof HttpErrorResponse)) {
        this.indices = x.indices;
      } else if (x?.indices && (x.indices instanceof HttpErrorResponse)) {
        this.logService.snackBarError(x.indices);
      }

      if (x?.options && !(x.options instanceof HttpErrorResponse)) {
        this.regexTaggerOptions = x.options;
      } else if (x?.options && (x.options instanceof HttpErrorResponse)) {
        this.logService.snackBarError(x.options);
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroyed$)).subscribe(currentProjIndices => {
      if (currentProjIndices) {
        const indicesForm = this.regexTaggerGroupForm.get('indicesFormControl');
        indicesForm?.setValue(currentProjIndices);
        this.projectFields = ProjectIndex.filterFields(currentProjIndices, [], ['fact']);
      }
    });

  }

  public indicesOpenedChange(opened: boolean): void {
    const indicesForm = this.regexTaggerGroupForm.get('indicesFormControl');
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && indicesForm?.value && !UtilityFunctions.arrayValuesEqual(indicesForm?.value, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.filterFields(indicesForm?.value, [], ['fact']);
    }
  }

  onQueryChanged(query: string): void {
    this.query = query ? query : this.defaultQuery;
  }

  onSubmit(formData: {
    descriptionFormControl: string;
    indicesFormControl: ProjectIndex[],
    fieldsFormControl: Field[],
    regexTaggersFormControl: RegexTagger[];
  }): void {

    from(formData.regexTaggersFormControl).pipe(mergeMap(group => {
      const body = {
        description: formData.descriptionFormControl,
        indices: formData.indicesFormControl.map((x: ProjectIndex) => [{name: x.index}]).flat(),
        fields: formData.fieldsFormControl,
        ...this.query ? {query: this.query} : {}
      };

      return this.regexTaggerGroupService.applyRegexTaggerGroup(this.currentProject.id, group.id, body);
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`${resp.message}`, 2000);
        this.dialogRef.close(resp);
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

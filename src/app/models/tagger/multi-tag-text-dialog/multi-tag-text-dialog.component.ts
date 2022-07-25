import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, Observable, of, Subject} from 'rxjs';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {Tagger} from '../../../shared/types/tasks/Tagger';
import {Project} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {ResultsWrapper} from '../../../shared/types/Generic';
import {ScrollableDataSource} from '../../../shared/ScrollableDataSource';
import {UntypedFormControl} from '@angular/forms';

interface FormModel {
  text: string;
  selectedTaggers: Tagger[];
  lemmatize: boolean;
  feedback: boolean;
  hideFalse: boolean;
}

@Component({
  selector: 'app-multi-tag-text-dialog',
  templateUrl: './multi-tag-text-dialog.component.html',
  styleUrls: ['./multi-tag-text-dialog.component.scss']
})
export class MultiTagTextDialogComponent implements OnInit, OnDestroy {
  result: { result: boolean, probability: number, feedback?: { id: string }, tag: string };
  isLoading = false;
  currentProject: Project;
  formModel = {text: '', selectedTaggers: [], lemmatize: false, feedback: false, hideFalse: false};
  taggers: ScrollableDataSource<Tagger>;
  taggerSelectionFormControl = new UntypedFormControl([]);
  // tslint:disable-next-line:no-any
  taggerOptions: any;
  destroyed$: Subject<boolean> = new Subject();

  constructor(private taggerService: TaggerService, private logService: LogService, private projectStore: ProjectStore) {
  }

  onSubmit(formModel: FormModel): void {
    this.isLoading = true;
    const body = {
      text: formModel.text,
      feedback_enabled: formModel.feedback,
      lemmatize: formModel.lemmatize,
      hide_false: formModel.hideFalse,
      taggers: this.taggerSelectionFormControl.value?.map((x: { id: number; }) => x.id) || [],
    };
    this.taggerService.multiTagText(this.currentProject.id, body).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else {
        this.logService.snackBarError(resp, 4000);
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap((currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        this.taggers = new ScrollableDataSource(this.fetchFn, this);
        return forkJoin({
          options: this.taggerService.getMultiTagTextOptions(currentProject.id)
        });
      }
      return of(null);
    }))).subscribe(resp => {
      if (resp && !(resp.options instanceof HttpErrorResponse)) {
        this.taggerOptions = resp.options;
      }

      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError.bind(this.logService));
    });
  }
  fetchFn(pageNr: number, pageSize: number,
          filterParam: string, context: this): Observable<ResultsWrapper<Tagger> | HttpErrorResponse> {
    return context.taggerService.getTaggers(context.currentProject.id, `${filterParam}&page=${pageNr + 1}&page_size=${pageSize}`);
  }
}

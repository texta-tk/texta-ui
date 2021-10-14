import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {filter, switchMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {TaggerService} from '../../../core/models/taggers/tagger.service';
import {Tagger} from '../../../shared/types/tasks/Tagger';
import {Project} from '../../../shared/types/Project';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';

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
  taggers: Tagger[];
  currentProject: Project;
  formModel = {text: '', selectedTaggers: [], lemmatize: false, feedback: false, hideFalse: false};
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
      taggers: this.formModel.selectedTaggers,
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
        return forkJoin({
          options: this.taggerService.getMultiTagTextOptions(currentProject.id),
          taggers: this.taggerService.getTaggers(this.currentProject.id, '&page_size=9999')
        });
      }
      return of(null);
    }))).subscribe(resp => {
      if (resp && !(resp.options instanceof HttpErrorResponse)) {
        this.taggerOptions = resp;
      }
      if (resp?.taggers && !(resp.taggers instanceof HttpErrorResponse)) {
        this.taggers = resp.taggers.results;
      }

      UtilityFunctions.logForkJoinErrors(resp, HttpErrorResponse, this.logService.snackBarError);
    });
  }
}

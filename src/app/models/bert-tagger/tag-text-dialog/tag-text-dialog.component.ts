import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';
import {filter, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent implements OnInit, OnDestroy {
  result: { result: boolean, probability: number, feedback?: { id: string } };
  feedback = false;
  isLoading = false;
  // tslint:disable-next-line:no-any
  bertOptions: any;

  constructor(private bertTaggerService: BertTaggerService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: BertTagger; }) {
  }

  onSubmit(value: string): void {
    this.isLoading = true;
    this.bertTaggerService.tagText({
      text: value,
      feedback_enabled: this.feedback,
    }, this.data.currentProjectId, this.data.tagger.id)
      .subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp as { result: boolean, probability: number, feedback?: { id: string } };
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
      }, null, () => this.isLoading = false);
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(filter(x => !!x), take(1), switchMap(proj => {
      if (proj) {
        return this.bertTaggerService.tagTextOptions(proj.id, this.data.tagger.id);
      }
      return of(null);
    })).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.bertOptions = options;
      }
    });
  }
}

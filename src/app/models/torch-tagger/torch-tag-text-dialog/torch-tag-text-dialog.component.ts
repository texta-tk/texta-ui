import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {LogService} from 'src/app/core/util/log.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-torch-tag-text-dialog',
  templateUrl: './torch-tag-text-dialog.component.html',
  styleUrls: ['./torch-tag-text-dialog.component.scss']
})
export class TorchTagTextDialogComponent implements OnInit, OnDestroy{
  lemmatize: boolean;
  result: { result: boolean, probability: number };


  destroyed$ = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  tagTextOptions: any;
  constructor(private torchTorchTaggerService: TorchTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, torchTorchTaggerId: number; }) {
  }
  ngOnInit(): void {
    this.torchTorchTaggerService.getTagTextOptions(this.data.currentProjectId, this.data.torchTorchTaggerId).pipe(
      takeUntil(this.destroyed$)).subscribe(options => {
      if (options && !(options instanceof HttpErrorResponse)) {
        this.tagTextOptions = options;
      }
    });
  }

  onSubmit(value: string): void {
    this.torchTorchTaggerService.tagText({
      text: value,
      lemmatize: this.lemmatize
    }, this.data.currentProjectId, this.data.torchTorchTaggerId)
      .subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp;
        } else {
          this.logService.snackBarError(resp, 4000);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

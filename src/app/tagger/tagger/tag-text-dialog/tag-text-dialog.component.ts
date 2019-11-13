import {Component, Inject} from '@angular/core';
import {TaggerService} from '../../../core/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-tag-text-dialog',
  templateUrl: './tag-text-dialog.component.html',
  styleUrls: ['./tag-text-dialog.component.scss']
})
export class TagTextDialogComponent {
  lemmatize: boolean;
  result: { result: boolean, probability: number };

  constructor(private taggerService: TaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerId: number; }) {
  }

  onSubmit(value) {
    this.taggerService.tagText({text: value, lemmatize: this.lemmatize}, this.data.currentProjectId, this.data.taggerId)
      .subscribe((resp: { result: boolean, probability: number } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp;
        } else if (resp instanceof HttpErrorResponse){
          this.logService.snackBarError(resp, 4000);
        }
    });
  }
}

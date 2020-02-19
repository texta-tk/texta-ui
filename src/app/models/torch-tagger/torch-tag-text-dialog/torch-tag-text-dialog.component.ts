import {Component, Inject} from '@angular/core';
import {TorchTaggerService} from '../../../core/models/taggers/torch-tagger.service';
import {LogService} from 'src/app/core/util/log.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-torch-tag-text-dialog',
  templateUrl: './torch-tag-text-dialog.component.html',
  styleUrls: ['./torch-tag-text-dialog.component.scss']
})
export class TorchTagTextDialogComponent {
  lemmatize: boolean;
  result: { result: boolean, probability: number };

  constructor(private torchTorchTaggerService: TorchTaggerService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, torchTorchTaggerId: number; }) {
  }

  onSubmit(value) {
    this.torchTorchTaggerService.tagText({
      text: value,
      lemmatize: this.lemmatize
    }, this.data.currentProjectId, this.data.torchTorchTaggerId)
      .subscribe((resp: { result: boolean, probability: number } | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp;
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
      });
  }
}

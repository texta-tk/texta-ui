import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmbeddingsService } from 'src/app/core/models/embeddings/embeddings.service';
import { HttpErrorResponse } from '@angular/common/http';
import { LogService } from 'src/app/core/util/log.service';

@Component({
  selector: 'app-phrase-dialog',
  templateUrl: './phrase-dialog.component.html',
  styleUrls: ['./phrase-dialog.component.scss']
})
export class PhraseDialogComponent {
  result: string;

  constructor(private embeddingService: EmbeddingsService, private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, embeddingId: number; }) {
  }

  onSubmit(value) {
    this.embeddingService.phrase({ text: value }, this.data.currentProjectId, this.data.embeddingId)
    .subscribe((resp: string | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.result = resp;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }
}

import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { take } from 'rxjs/operators';
import { EmbeddingsService } from 'src/app/core/embeddings/embeddings.service';

@Component({
  selector: 'app-phrase-dialog',
  templateUrl: './phrase-dialog.component.html',
  styleUrls: ['./phrase-dialog.component.scss']
})
export class PhraseDialogComponent {
  result: string;

  constructor(private embeddingService: EmbeddingsService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, embeddingId: number; }) {
  }

  onSubmit(value) {
    this.embeddingService.phrase({ text: value }, this.data.currentProjectId, this.data.embeddingId)
    .subscribe((resp: string) => {
      this.result = resp;
    });
  }
}

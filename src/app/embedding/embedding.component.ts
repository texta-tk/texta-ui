import {Component, OnInit} from '@angular/core';
import {EmbeddingsService} from '../core/embeddings/embeddings.service';
import {HttpErrorResponse} from "@angular/common/http";
import {Embedding} from "../../shared/types/Embedding";

@Component({
  selector: 'app-embedding',
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.scss']
})
export class EmbeddingComponent implements OnInit {

  embeddings: Embedding[] = [];

  constructor(private embeddingsService: EmbeddingsService) {
  }

  ngOnInit() {
    this.embeddingsService.getEmbeddings().subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.embeddings = resp;
      }
    });
  }

}

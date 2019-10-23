import { Component, OnInit, Inject } from '@angular/core';
import { EmbeddingsGroupService } from 'src/app/core/embeddings/embeddings-group.service';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-browse-clusters-dialog',
  templateUrl: './browse-clusters-dialog.component.html',
  styleUrls: ['./browse-clusters-dialog.component.scss']
})
export class BrowseClustersDialogComponent implements OnInit {
  numClusters = 50;
  maxClusterExamples = 10;
  clusterOrder = 'ascending';
  result: [] = [];


  constructor(private embGroupService: EmbeddingsGroupService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, embeddingClusterId: number; }) {
}

  ngOnInit() {
  }

}

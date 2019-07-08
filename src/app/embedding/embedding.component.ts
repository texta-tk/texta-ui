import {Component, OnDestroy, OnInit} from '@angular/core';
import {EmbeddingsService} from '../core/embeddings/embeddings.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Embedding} from '../../shared/types/Embedding';
import {ProjectStore} from '../core/projects/project.store';
import {Project} from '../../shared/types/Project';
import {mergeMap} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {MatDialog} from '@angular/material';
import {CreateEmbeddingDialogComponent} from './create-embedding-dialog/create-embedding-dialog.component';

@Component({
  selector: 'app-embedding',
  templateUrl: './embedding.component.html',
  styleUrls: ['./embedding.component.scss']
})
export class EmbeddingComponent implements OnInit, OnDestroy {

  embeddings: Embedding[] = [];
  projectSubscription: Subscription;

  constructor(private projectStore: ProjectStore, private embeddingsService: EmbeddingsService, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(mergeMap((currentProject: Project) => {
      if (currentProject) {
        return this.embeddingsService.getEmbeddings(currentProject.id);
      }
      return of(null);
    })).subscribe((resp: Embedding[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.embeddings = resp;
      }
    });

  }

  ngOnDestroy() {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateEmbeddingDialogComponent, {
      height: '490px',
      width: '700px',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        console.log(resp);
        this.embeddings.push(resp);
      }
    });
  }
}

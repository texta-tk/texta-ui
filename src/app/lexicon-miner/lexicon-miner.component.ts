import {Component, OnDestroy, OnInit} from '@angular/core';
import {EmbeddingsService} from '../core/embeddings/embeddings.service';
import {ProjectStore} from '../core/projects/project.store';
import {switchMap, take} from 'rxjs/operators';
import {Project} from '../shared/types/Project';
import {BehaviorSubject, of, Subscription} from 'rxjs';
import {Embedding} from '../shared/types/tasks/Embedding';
import {FormControl} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {MatListOption} from '@angular/material';
import {LogService} from '../core/util/log.service';

@Component({
  selector: 'app-lexicon-miner',
  templateUrl: './lexicon-miner.component.html',
  styleUrls: ['./lexicon-miner.component.scss']
})
export class LexiconMinerComponent implements OnInit, OnDestroy {
  projectSubscription: Subscription;
  selectedEmbedding: BehaviorSubject<Embedding> = new BehaviorSubject(null);
  embeddings: Embedding[] = [];
  embeddingFormControl: FormControl = new FormControl();
  predictions: any[] = [];
  positives: any[] = [];
  negatives: any[] = [];
  textFormControl: FormControl = new FormControl();
  newItem = false;

  constructor(private embeddingsService: EmbeddingsService, private projectStore: ProjectStore,
              private logService: LogService) {
  }

  ngOnInit() {
    this.projectSubscription = this.projectStore.getCurrentProject().pipe(switchMap((project: Project) => {
      if (project) {
        return this.embeddingsService.getEmbeddings(project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse)) {
        this.embeddings = resp;
      }
    });
    // hmm
    /*   this.textFormControl.valueChanges.pipe(debounceTime(250), switchMap(value => {
         return this.projectStore.getCurrentProject().pipe(switchMap((project: Project) => {
           return this.selectedEmbedding.pipe(switchMap((embedding: Embedding) => {
             if (embedding) {
               return this.embeddingsService.predict({positives: [value]}, project.id, embedding.id);
             }
             return of(null);
           }));
         }));
       })).subscribe((resp: any | HttpErrorResponse) => {
         if (!(resp instanceof HttpErrorResponse)) {
           this.predictions = resp;
         }
       });*/
  }

  addNewItem() {
    this.newItem = true;
  }

  addPositive(x) {
    this.positives.unshift({phrase: x});
    this.newItem = false;
  }

  removePositive(item) {
    console.log(item);
    this.positives = this.positives.filter((x: any) => {
      return x.phrase !== item.phrase;
    });
  }

  removeNegative(item) {
    console.log(item);
    this.negatives = this.negatives.filter((x: any) => {
      return x.phrase !== item.phrase;
    });
  }

  onNewPredictionsClick(value: MatListOption[]) {
    value.map((item: any) => {
      // getting negatives (the ones user didnt select)
      this.predictions = this.predictions.filter((x: any) => {
        return x.phrase !== item.value.phrase;
      });
      return this.positives.push(item.value);
    });
    this.negatives = [...this.negatives, ...this.predictions];
    this.getNewPredictions();
  }

  getNewPredictions() {
    this.projectStore.getCurrentProject().pipe(take(1), switchMap((project: Project) => {
      return this.selectedEmbedding.pipe(take(1), switchMap((embedding: Embedding) => {
        if (embedding) {
          return this.embeddingsService.predict({
            positives: this.positives.map(x => x.phrase),
            negatives: this.negatives.map(y => y.phrase)
          }, project.id, embedding.id);
        }
        return of(null);
      }));
    })).subscribe((resp: any) => {
      if (resp) {
        if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        } else {
          this.predictions = resp;
        }
      }
    });
  }

  embeddingSelected(value: Embedding) {
    this.selectedEmbedding.next(value);
  }

  ngOnDestroy() {
    if (this.projectSubscription) {
      this.projectSubscription.unsubscribe();
    }
  }

}

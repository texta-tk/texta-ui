import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
import {forkJoin, of, Subject} from 'rxjs';
import {BertTagger} from '../../../shared/types/tasks/BertTagger';
import {BertTaggerService} from '../../../core/models/taggers/bert-tagger/bert-tagger.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-edit-bert-tagger-dialog',
  templateUrl: './edit-bert-tagger-dialog.component.html',
  styleUrls: ['./edit-bert-tagger-dialog.component.scss']
})
export class EditBertTaggerDialogComponent implements OnInit, OnDestroy {

  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  destroyed$: Subject<boolean> = new Subject<boolean>();

  // tslint:disable-next-line:no-any
  bertOptions: any;

  constructor(private dialogRef: MatDialogRef<EditBertTaggerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: BertTagger,
              private bertTaggerService: BertTaggerService,
              private projectStore: ProjectStore) {
    this.data = {...this.data};
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.bertTaggerService.editTagger({
          description: this.data.description,
          use_gpu: this.data.use_gpu
        }, project.id, this.data.id);
      }
      return of(null);
    })).subscribe(resp => {
      this.dialogRef.close(resp);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), mergeMap(currentProject => {
      if (currentProject) {
        return this.bertTaggerService.getBertTaggerOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.bertOptions = resp;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}

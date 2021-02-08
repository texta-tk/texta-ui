import {Component, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {BertTaggerService} from '../../../core/models/bert-tagger/bert-tagger.service';
import {mergeMap, take} from 'rxjs/operators';
import {of} from 'rxjs';
import {ProjectStore} from '../../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../../core/util/log.service';

@Component({
  selector: 'app-add-bert-model-dialog',
  templateUrl: './add-bert-model-dialog.component.html',
  styleUrls: ['./add-bert-model-dialog.component.scss']
})
export class AddBertModelDialogComponent implements OnInit {
  modelName: string;

  constructor(private bertService: BertTaggerService, private projectStore: ProjectStore, private logService: LogService) {
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.bertService.downloadBertModel(project.id, this.modelName);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp instanceof HttpErrorResponse){
        this.logService.snackBarError(resp);
      }else{
        this.logService.snackBarMessage(resp || '', 5000);
      }
    });


  }
}

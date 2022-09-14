import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {LogService} from '../../core/util/log.service';
import {ProjectStore} from '../../core/projects/project.store';
import {LexiconService} from '../../core/lexicon/lexicon.service';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../shared/CustomerErrorStateMatchers';
import {mergeMap, take} from "rxjs/operators";
import {of} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-create-lexicon-dialog-component',
  templateUrl: './create-lexicon-dialog-component.component.html',
  styleUrls: ['./create-lexicon-dialog-component.component.scss']
})
export class CreateLexiconDialogComponentComponent {
  description: string;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  createRequestInProgress = false;

  constructor(private dialogRef: MatDialogRef<CreateLexiconDialogComponentComponent>,
              private lexiconService: LexiconService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }


  onSubmit(): void {
    this.createRequestInProgress = true;
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.lexiconService.createLexicon({description: this.description}, project.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp);
      } else {
        this.dialogRef.close(resp);
      }
      this.createRequestInProgress = false;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

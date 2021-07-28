import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from "../../build-search/Constraints";

@Component({
  selector: 'app-edit-saved-search-dialog',
  templateUrl: './edit-saved-search-dialog.component.html',
  styleUrls: ['./edit-saved-search-dialog.component.scss']
})
export class EditSavedSearchDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  destroyed$: Subject<boolean> = new Subject();

  constructor(private dialogRef: MatDialogRef<EditSavedSearchDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SavedSearch,
              private searcherService: SearcherService,
              private projectStore: ProjectStore) {
  }

  ngOnInit(): void {

  }

  onSubmit(): void {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap(project => {
      if (project) {
        return this.searcherService.editSavedSearchDescription(project.id, this.data.id, this.data.description);
      }
      return of(null);
    })).subscribe(resp => {
      this.dialogRef.close(resp);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

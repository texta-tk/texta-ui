import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../../shared/CustomerErrorStateMatchers';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Tagger} from '../../../../shared/types/tasks/Tagger';
import {TaggerService} from '../../../../core/models/taggers/tagger.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {mergeMap, take} from 'rxjs/operators';
import {Project} from '../../../../shared/types/Project';
import {of} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {SearcherService} from '../../../../core/searcher/searcher.service';

@Component({
  selector: 'app-edit-saved-search-dialog',
  templateUrl: './edit-saved-search-dialog.component.html',
  styleUrls: ['./edit-saved-search-dialog.component.scss']
})
export class EditSavedSearchDialogComponent implements OnInit {
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();

  constructor(private dialogRef: MatDialogRef<EditSavedSearchDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: SavedSearch,
              private searcherService: SearcherService,
              private projectStore: ProjectStore) {
  }

  ngOnInit() {
  }

  onSubmit() {
    this.projectStore.getCurrentProject().pipe(take(1), mergeMap((project: Project) => {
      if (project) {
        return this.searcherService.editSavedSearch(project.id, this.data.id, {description: this.data.description});
      }
      return of(null);
    })).subscribe((resp: SavedSearch | HttpErrorResponse) => {
        this.dialogRef.close(resp);
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

}

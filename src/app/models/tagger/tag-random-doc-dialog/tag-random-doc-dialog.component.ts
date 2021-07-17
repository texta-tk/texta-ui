import {Component, Inject, OnInit} from '@angular/core';
import {TaggerService} from 'src/app/core/models/taggers/tagger.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Tagger} from 'src/app/shared/types/tasks/Tagger';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {take} from 'rxjs/operators';
import {ProjectIndex} from '../../../shared/types/Project';

@Component({
  selector: 'app-tag-random-doc-dialog',
  templateUrl: './tag-random-doc-dialog.component.html',
  styleUrls: ['./tag-random-doc-dialog.component.scss']
})
export class TagRandomDocDialogComponent implements OnInit {
  result: { document: unknown, prediction: { result: boolean, probability: number, tag: string; } };
  isLoading = false;
  indices: ProjectIndex[];

  constructor(private taggerService: TaggerService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, tagger: Tagger; }) {
  }

  ngOnInit(): void {
    this.projectStore.getSelectedProjectIndices().pipe(take(1)).subscribe(x => {
      if (x) {
        this.indices = x;
        this.onSubmit();
      }
    });
  }

  onSubmit(): void {
    this.isLoading = true;
    this.taggerService.tagRandomDocument(this.data.currentProjectId, this.data.tagger.id,
      {indices: this.indices.map(x => [{name: x.index}]).flat()})
      // tslint:disable-next-line:no-any
      .subscribe((resp: any | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.result = resp;
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 4000);
        }
        this.isLoading = false;
      });
  }
}

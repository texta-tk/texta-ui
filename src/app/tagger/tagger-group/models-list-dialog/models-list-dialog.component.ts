import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {TaggerGroupService} from 'src/app/core/taggers/tagger-group.service';
import {MAT_DIALOG_DATA, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from 'src/app/core/util/log.service';
import {LightTagger} from 'src/app/shared/types/tasks/Tagger';

@Component({
  selector: 'app-models-list-dialog',
  templateUrl: './models-list-dialog.component.html',
  styleUrls: ['./models-list-dialog.component.scss']
})
export class ModelsListDialogComponent implements OnInit {
  public tableData: MatTableDataSource<LightTagger>;
  public displayedColumns: string[] = ['id', 'tag', 'status'];
  public isLoadingResults = true;

  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(private taggerGroupService: TaggerGroupService,
              private logService: LogService,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, taggerGroupId: number; }) {
  }

  ngOnInit() {
    this.taggerGroupService.getModelsList(this.data.taggerGroupId, this.data.currentProjectId).subscribe(
      (resp: LightTagger[] | HttpErrorResponse) => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.tableData = new MatTableDataSource(resp);
          this.tableData.sort = this.sort;
          this.tableData.paginator = this.paginator;
          this.isLoadingResults = false;
        } else if (resp instanceof HttpErrorResponse) {
          this.logService.snackBarError(resp, 5000);
        }
      }
    );
  }

}

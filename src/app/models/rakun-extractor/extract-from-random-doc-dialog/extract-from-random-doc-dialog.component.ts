import {Component, Inject, OnInit} from '@angular/core';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {ProjectIndex} from '../../../shared/types/Project';
import {SelectionModel} from '@angular/cdk/collections';
import {Subject} from 'rxjs';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {filter, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../../shared/UtilityFunctions';
import {HttpErrorResponse} from '@angular/common/http';
import {RakunExtractorService} from '../../../core/models/rakun-extractor/rakun-extractor.service';
import {RakunExtractor} from '../../../shared/types/tasks/RakunExtractor';
import {Match} from '../../../shared/types/tasks/RegexTaggerGroup';

@Component({
  selector: 'app-extract-from-random-doc-dialog',
  templateUrl: './extract-from-random-doc-dialog.component.html',
  styleUrls: ['./extract-from-random-doc-dialog.component.scss']
})
export class ExtractFromRandomDocDialogComponent implements OnInit {
  // tslint:disable-next-line:no-any
  result: { document: unknown, matches: any[]};
  fields: string[] = [];
  isLoading = false;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  model: { indices: ProjectIndex[], fields: string[] } = {indices: [], fields: []};
  projectIndices: ProjectIndex[];
  projectFields: ProjectIndex[] = [];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();
  selection = new SelectionModel<number | string>(true, [0, 1]);
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private rakunExtractorService: RakunExtractorService, private logService: LogService, private projectStore: ProjectStore,
              @Inject(MAT_DIALOG_DATA) public data: { currentProjectId: number, rakun: RakunExtractor; }) {
  }

  taggerIdAccessor = (x: { probability: string; }) => 'probability: ' + x.probability;

  ngOnInit(): void {
    this.projectStore.getProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.projectIndices = x;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(filter(x => !!x), take(1)).subscribe(x => {
      if (x) {
        this.model.indices = x;
        this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
      }
    });
  }

  public indicesOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && this.model.indices && !UtilityFunctions.arrayValuesEqual(this.model.indices, this.projectFields, (x => x.index))) {
      this.projectFields = ProjectIndex.cleanProjectIndicesFields(this.model.indices, [], ['fact'], true);
    }
  }

  onSubmit(): void {
    if (this.data.currentProjectId && this.data.rakun) {
      this.isLoading = true;
      const body = {
        indices: this.model.indices.map(x => [{name: x.index}]).flat(),
        fields: this.model.fields,
        add_spans: true,
      };
      this.rakunExtractorService.extractFromRandomDocument(this.data.currentProjectId, this.data.rakun.id, body).subscribe(x => {
        if (x && !(x instanceof HttpErrorResponse)) {
          this.result = {
            document: x.document,
            matches: x.keywords,
          };
        } else if (x) {
          this.logService.snackBarError(x);
        }
        this.isLoading = false;
      });
    }
  }
}

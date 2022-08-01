import {Component, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl, UntypedFormGroup, Validators} from '@angular/forms';
import {switchMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {Choice, MLPOptions} from '../../../shared/types/tasks/MLPOptions';
import {HttpErrorResponse} from '@angular/common/http';
import {MatDialogRef} from '@angular/material/dialog';
import {ProjectService} from '../../../core/projects/project.service';
import {MLPService} from '../../../core/tools/mlp/mlp.service';
import {LogService} from '../../../core/util/log.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {Project} from '../../../shared/types/Project';
import {ErrorStateMatcher} from '@angular/material/core';
import {LiveErrorStateMatcher} from '../../../shared/CustomerErrorStateMatchers';
import {Match} from "../../../shared/types/tasks/RegexTaggerGroup";
import {UtilityFunctions} from "../../../shared/UtilityFunctions";
import {HighlightSettings} from "../../../shared/SettingVars";

@Component({
  selector: 'app-mlp-apply-text-dialog',
  templateUrl: './mlp-apply-text-dialog.component.html',
  styleUrls: ['./mlp-apply-text-dialog.component.scss']
})
export class MLPApplyTextDialogComponent implements OnInit, OnDestroy {

  analyzers: Choice[];
  destroyed$: Subject<boolean> = new Subject<boolean>();
  MLPForm = new UntypedFormGroup({
    textFormControl: new UntypedFormControl('', [Validators.required]),
    analyzersFormControl: new UntypedFormControl([], [Validators.required]),
  });
  currentProject: Project;
  result: any;
  isLoading: boolean;
  matcher: ErrorStateMatcher = new LiveErrorStateMatcher();
  resultFields: string[];
  colorMap: Map<string, { backgroundColor: string, textColor: string }> = new Map();

  // tslint:disable-next-line:no-any
  mlpOptions: any;
  defaultColors = HighlightSettings.legibleColors;

  constructor(private dialogRef: MatDialogRef<MLPApplyTextDialogComponent>,
              private projectService: ProjectService,
              private mlpService: MLPService,
              private logService: LogService,
              private projectStore: ProjectStore) {
  }

  // tslint:disable-next-line:no-any
  idAccessor = (x: any) => x.fact;

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroyed$), switchMap(currentProject => {
      if (currentProject) {
        this.currentProject = currentProject;
        return this.mlpService.getMLPOptions(currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe((resp: MLPOptions | HttpErrorResponse | null) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.mlpOptions = resp;
        this.analyzers = resp.actions.POST.analyzers.choices;
      } else if (resp instanceof HttpErrorResponse) {
        this.logService.snackBarError(resp, 5000);
      }
    });
  }

  onSubmit(formGroup: { analyzersFormControl: string[]; textFormControl: string; }): void {
    this.isLoading = true;
    this.mlpService.applyMLPText({
      analyzers: formGroup.analyzersFormControl,
      texts: [formGroup.textFormControl]
    }).subscribe((x) => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.result = x;
        this.result[0].text_mlp.texta_facts = x[0].texta_facts;
        this.result[0].text_mlp.texta_facts.forEach((y: { doc_path: string; }) => y.doc_path = 'text');
        this.resultFields = Object.keys(x[0].text_mlp).filter(y => y !== 'language');
        this.getUniqueFacts(x[0].texta_facts);
      } else if (x instanceof HttpErrorResponse) {
        this.logService.snackBarError(x, 2000);
      }
    }, () => {
    }, () => this.isLoading = false);
  }

  getUniqueFacts(matches: Match[]): { fact: Match; textColor: string; backgroundColor: string }[] {
    const returnVal: { fact: Match, textColor: string, backgroundColor: string }[] = [];
    const uniques = UtilityFunctions.getDistinctByProperty(matches, (y => y.fact));
    for (let i = 0; i < uniques.length; i++) {
      if (i < this.defaultColors.length) {
        const color = this.defaultColors[i];
        this.colorMap.set(uniques[i].fact, color);
        returnVal.push({
          fact: uniques[i],
          backgroundColor: color.backgroundColor,
          textColor: color.textColor
        });
      } else {
        const color = {
          // tslint:disable-next-line:no-bitwise
          backgroundColor: `hsla(${~~(360 * Math.random())},70%,70%,0.8)`,
          textColor: 'black'
        };
        this.colorMap.set(uniques[i].fact, color);
        returnVal.push({
          fact: uniques[i],
          backgroundColor: color.backgroundColor,
          textColor: color.textColor
        });
      }
    }
    return returnVal;
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

}

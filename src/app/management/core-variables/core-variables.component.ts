import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {CoreService} from '../../core/core.service';

class CoreVariable {
  // tslint:disable-next-line:variable-name
  constructor(public value: string, public env_value: string, public url: string, public name: string) {
  }
}

@Component({
  selector: 'app-core-variables',
  templateUrl: './core-variables.component.html',
  styleUrls: ['./core-variables.component.scss']
})
export class CoreVariablesComponent implements OnInit {
  coreVariables: CoreVariable[];
  coreVariablesOriginal: CoreVariable[];

  constructor(private coreService: CoreService, private logService: LogService) {
  }

  ngOnInit(): void {
    this.coreService.getCoreVariables().subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.coreVariables = UtilityFunctions.sortByStringProperty(x, (y => y.name));
        this.coreVariablesOriginal = JSON.parse(JSON.stringify(x));
      }
    });
  }

  submit(): void {
    const changed: CoreVariable[] = [];
    this.coreVariables.forEach(x => {
      if (this.coreVariablesOriginal.find(y => (y.name === x.name && y.value !== x.value))) {
        changed.push(x);
      }
    });
    changed.forEach(x => {
      const formData = new FormData();
      formData.append('name', x.name);
      formData.append('value', x.value);

      this.coreService.patchCoreVariables(formData, x.url).subscribe(resp => {
        if (resp && !(resp instanceof HttpErrorResponse)) {
          this.logService.snackBarMessage(`Updated core variables`, 2000);
        } else if (x) {
          this.logService.snackBarError(resp, 2000);
        }
      });
    });
  }

}

import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';
import {LogService} from '../../core/util/log.service';

class CoreVariable {
  constructor(public value: string, public env_value: string, public url: string, public name: string) {
  }
}

@Component({
  selector: 'app-core-variables',
  templateUrl: './core-variables.component.html',
  styleUrls: ['./core-variables.component.scss']
})
export class CoreVariablesComponent implements OnInit {
  coreVariable = new CoreVariable('', '', '', '');
  coreVariables: CoreVariable[];

  constructor(private projectService: ProjectService, private logService: LogService) {
  }

  ngOnInit(): void {
    this.projectService.getCoreVariables().subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.coreVariables = x;
      }
    });
  }

  coreVariableSelected(val: CoreVariable) {
    this.coreVariable.value = val.value ? val.value : val.env_value;
  }

  submit() {
    const formData = new FormData();
    formData.append('name', this.coreVariable.name);
    formData.append('value', this.coreVariable.value);
    this.projectService.patchCoreVariables(formData, this.coreVariable.url).subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.logService.snackBarMessage(`Updated ${this.coreVariable.name}`, 2000);
      } else if (x) {
        this.logService.snackBarError(x, 2000);
      }
    });
  }

}

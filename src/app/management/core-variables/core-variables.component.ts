import {Component, OnInit} from '@angular/core';
import {ProjectService} from '../../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-core-variables',
  templateUrl: './core-variables.component.html',
  styleUrls: ['./core-variables.component.scss']
})
export class CoreVariablesComponent implements OnInit {
  coreVariable: string;
  coreVariables: any[];
  coreVariableValue: string;

  constructor(private projectService: ProjectService) {
  }

  ngOnInit(): void {
    this.projectService.getCoreVariables().subscribe(x => {
      if (x && !(x instanceof HttpErrorResponse)) {
        this.coreVariables = x;
      }
    });
  }

}

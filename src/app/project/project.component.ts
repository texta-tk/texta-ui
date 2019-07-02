import { Component, OnInit } from '@angular/core';
import {Project} from '../../shared/types/Project';
import {ProjectService} from '../core/projects/project.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  projects: Project[];

  constructor(private projectService: ProjectService) {
  }

  ngOnInit() {
    this.projectService.getProjects().subscribe((resp: Project[] | HttpErrorResponse) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.projects = resp;
      }
    });
  }

}

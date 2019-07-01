import {Component, OnInit} from '@angular/core';
import {Project} from '../../shared/types/Project';
import {HttpErrorResponse} from '@angular/common/http';
import {ProjectService} from '../core/projects/project.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
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

import {Component, Input, OnInit} from '@angular/core';
import {TextaTask} from '../../../types/tasks/TaskStatus';

@Component({
  selector: 'app-task-progress',
  templateUrl: './task-progress.component.html',
  styleUrls: ['./task-progress.component.scss']
})
export class TaskProgressComponent implements OnInit {
  @Input() task: TextaTask;
  constructor() { }

  ngOnInit(): void {
  }

}

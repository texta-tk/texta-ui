import {Component, Input, OnInit} from '@angular/core';
import {TextaTask} from '../../../types/tasks/TaskStatus';

@Component({
  selector: 'app-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.scss']
})
export class TaskTableComponent implements OnInit {
  tasks: TextaTask[] = [];

  @Input() set textaTasks(val: TextaTask[]) {
    this.tasks = val;
    this.currentTask = val.length - 1;
  };

  currentTask = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

}

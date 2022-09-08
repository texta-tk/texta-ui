import {Component, Input, OnInit} from '@angular/core';
import {TextaTask} from '../../../types/tasks/TaskStatus';

@Component({
  selector: 'app-task-progress',
  templateUrl: './task-progress.component.html',
  styleUrls: ['./task-progress.component.scss']
})
export class TaskProgressComponent implements OnInit {
  @Input() task: TextaTask;
  errorsLength = 0;

  constructor() {
  }

  ngOnInit(): void {
    if (this.task && this.task.errors) {
      try {
        const errors = JSON.parse(this.task.errors) as string[];
        this.errorsLength = errors.length;
      } catch (e) {
        this.errorsLength = 0;
      }
    }
  }

}

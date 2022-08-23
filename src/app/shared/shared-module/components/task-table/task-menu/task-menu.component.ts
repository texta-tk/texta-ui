import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TextaTask} from '../../../../types/tasks/TaskStatus';

@Component({
  selector: 'app-task-menu',
  templateUrl: './task-menu.component.html',
  styleUrls: ['./task-menu.component.scss']
})
export class TaskMenuComponent implements OnInit {
  @Input() tasks: TextaTask[] = [];
  @Output() selectedTask = new EventEmitter<number>();
  activeTask = 0;

  constructor() {
  }

  ngOnInit(): void {
  }

  selectTaskItem(i: number): void {
    this.activeTask = i;
    this.selectedTask.emit(i);
  }
}

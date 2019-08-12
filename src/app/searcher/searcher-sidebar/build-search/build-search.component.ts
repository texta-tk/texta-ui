import {Component, Input, OnInit} from '@angular/core';
import {ProjectField} from '../../../shared/types/ProjectField';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss']
})
export class BuildSearchComponent implements OnInit {
  @Input() projectFields: ProjectField[] = [];
  fieldsFormControl = new FormControl();
  filtersList: ProjectField[][] = [];

  constructor() {
  }

  ngOnInit() {
  }

  onOpenedChange(opened) {
    // true is opened, false is closed
    if (!opened && this.fieldsFormControl.value) {
      this.filtersList.push(this.fieldsFormControl.value);
      this.fieldsFormControl.reset();
      console.log(this.filtersList);
    }
  }

  removeFilter(index) {
    console.log(index);
    this.filtersList.splice(index, 1);
  }

}

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EpochReportGraphComponent} from './epoch-report-graph.component';
import {MatDialogRef} from "@angular/material/dialog";
import {SharedModule} from "../../shared-module/shared.module";

describe('EpochReportGraphComponent', () => {
  let component: EpochReportGraphComponent;
  let fixture: ComponentFixture<EpochReportGraphComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EpochReportGraphComponent],
      imports: [SharedModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpochReportGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

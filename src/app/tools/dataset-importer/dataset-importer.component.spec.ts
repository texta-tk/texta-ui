import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasetImporterComponent } from './dataset-importer.component';

describe('DatasetImporterComponent', () => {
  let component: DatasetImporterComponent;
  let fixture: ComponentFixture<DatasetImporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatasetImporterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasetImporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

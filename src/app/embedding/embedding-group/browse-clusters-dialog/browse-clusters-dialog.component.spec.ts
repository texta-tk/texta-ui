import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseClustersDialogComponent } from './browse-clusters-dialog.component';

describe('BrowseClustersDialogComponent', () => {
  let component: BrowseClustersDialogComponent;
  let fixture: ComponentFixture<BrowseClustersDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseClustersDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseClustersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

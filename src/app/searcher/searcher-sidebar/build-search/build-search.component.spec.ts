import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildSearchComponent } from './build-search.component';

describe('BuildSearchComponent', () => {
  let component: BuildSearchComponent;
  let fixture: ComponentFixture<BuildSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

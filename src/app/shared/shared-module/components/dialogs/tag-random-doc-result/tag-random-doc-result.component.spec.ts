import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagRandomDocResultComponent } from './tag-random-doc-result.component';

describe('TagRandomDocResultComponent', () => {
  let component: TagRandomDocResultComponent;
  let fixture: ComponentFixture<TagRandomDocResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagRandomDocResultComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagRandomDocResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

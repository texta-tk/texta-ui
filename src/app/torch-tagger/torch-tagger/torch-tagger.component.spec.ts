import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TorchTaggerComponent } from './torch-tagger.component';

describe('TorchTaggerComponent', () => {
  let component: TorchTaggerComponent;
  let fixture: ComponentFixture<TorchTaggerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TorchTaggerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TorchTaggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocsButtonComponent } from './docs-button.component';

describe('DocsButtonComponent', () => {
  let component: DocsButtonComponent;
  let fixture: ComponentFixture<DocsButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocsButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocsButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
